import { Injectable, NotFoundException, BadRequestException, Logger , ForbiddenException} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart_item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Product } from '../products/entities/product.entity';
import { User } from '../auth/entities/user.entity';
import { ProductVariable } from '../products/entities/product_variable.entity';

@Injectable()
export class CartsService {
  private readonly logger = new Logger(CartsService.name);
  constructor(
    @InjectRepository(Cart) private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(ProductVariable) private productVariablesRepository: Repository<ProductVariable>,
  ) {}

/*------------ Create cart and create item in cart ------------*/
async create(userId: string, createCartDto: CreateCartDto): Promise<Cart> {
  this.logger.log(`Creating/updating cart for userId: ${userId}`);

  // Log the items in the DTO
  this.logger.log('Items in cart:', createCartDto.items);

  // Find or create cart
  let cart = await this.cartsRepository.findOne({
    where: { user: { id: userId } },
    relations: ['user', 'cartItems', 'cartItems.product', 'cartItems.product.product_variables'],
  });

  // If cart does not exist, create a new cart for the user
  if (!cart) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.error(`User with id ${userId} not found`);
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    cart = this.cartsRepository.create({ user });
    cart = await this.cartsRepository.save(cart);  // Save the newly created cart
    this.logger.log(`New cart created for user ${userId}`);
  }

  // Ensure that the user exists in the cart
  if (!cart.user) {
    this.logger.error(`User with id ${userId} not found`);
    throw new NotFoundException(`User with id ${userId} not found`);
  }

  // Create new cart items
  const newItems = await Promise.all(createCartDto.items.map(async (itemDto) => {
    const product = await this.productsRepository.findOne({
      where: { id: itemDto.productId },
      relations: ['product_variables'],
    });
    if (!product) {
      this.logger.error(`Product with id ${itemDto.productId} not found`);
      throw new NotFoundException(`Product with id ${itemDto.productId} not found`);
    }

    let productVariable: ProductVariable | null = null;

    // If product has size variants
    if (product.product_variables && product.product_variables.length > 0) {
      // If only one size exists, automatically select it
      if (product.product_variables.length === 1) {
        productVariable = product.product_variables[0];
        itemDto.size = productVariable.size; // Automatically set the size
      } else {
        // If multiple size variants, validate the provided size
        productVariable = product.product_variables.find(variable =>
          variable.size.toLowerCase() === itemDto.size.trim().toLowerCase()) || null;
        if (!productVariable) {
          this.logger.error(`Size "${itemDto.size}" not found for product ${itemDto.productId}`);
          throw new BadRequestException(`Size "${itemDto.size}" not available for the product`);
        }
      }
    } else {
      // If no size variants exist, check against the total quantity
      if (itemDto.size) {
        this.logger.error(`Product ${itemDto.productId} does not have size variants. Please omit the size.`);
        throw new BadRequestException(`Product does not have size variants. Please provide only quantity.`);
      }
      // Create a dummy ProductVariable if no sizes exist
      productVariable = {
        id: '',
        size: '',
        product: product,
        quantity: product.total_quantity,
        created_at: new Date(),
        updated_at: new Date(),
      } as ProductVariable;
    }

    const availableQuantity = productVariable ? productVariable.quantity : product.total_quantity;

    // Validate quantity
    if (itemDto.quantity <= 0 || itemDto.quantity > availableQuantity) {
      const errorMessage = itemDto.quantity <= 0 ? 'Quantity must be greater than zero' :
        `Requested quantity exceeds available stock for ${productVariable ? `size "${itemDto.size}"` : 'product'}`;
      this.logger.error(errorMessage);
      throw new BadRequestException(errorMessage);
    }

    // Calculate price
    const price = product.discounted_price ?? product.original_price;

    // Check if the cart already contains the item with the same product and size
    const existingCartItem = cart.cartItems.find(
      (cartItem) => cartItem.product.id === itemDto.productId && cartItem.size === itemDto.size
    );

    if (existingCartItem) {
      // Log message and do not merge or update
      this.logger.log(`Item with product ${itemDto.productId} and size ${itemDto.size} already exists in the cart, skipping.`);
      throw new BadRequestException(`Item with product ${itemDto.productId} and size ${itemDto.size} already exists in the cart.`);
    }

    // If item does not exist, create a new cart item
    const newCartItem = this.cartItemsRepository.create({
      cart,
      product,
      quantity: itemDto.quantity,
      size: itemDto.size,
      price_at_cart: price * itemDto.quantity,
      product_variable: productVariable
    });
    return newCartItem; // Return the new cart item to be saved
  }));

  // Save new cart items (including any merged items)
  await this.cartItemsRepository.save(newItems);
  this.logger.log(`Saved ${newItems.length} new cart items`);

  // Reload and return updated cart
  const updatedCart = await this.cartsRepository.findOne({
    where: { id: cart.id },
    relations: ['user', 'cartItems', 'cartItems.product', 'cartItems.product.product_variables'],
  });

  this.logger.log(`Returning updated cart with id ${cart.id}`);
  return updatedCart!;
}





/*------------ Get all item in cart and update if product change ------------*/
async findByUser(userId: string): Promise<Cart> {
  this.logger.log(`Fetching cart for userId: ${userId}`);

  // Find the cart associated with the user
  const cart = await this.cartsRepository.findOne({
    where: { user: { id: userId } },
    relations: ['user', 'cartItems', 'cartItems.product', 'cartItems.product.product_variables'],
  });

  if (!cart) {
    this.logger.error(`Cart for userId ${userId} not found`);
    throw new NotFoundException(`Cart for userId ${userId} not found`);
  }

  this.logger.log(`Found cart with id ${cart.id} for user ${userId}`);

  // Check and delete cart items that are no longer related to valid products or product variables
  const itemsToDelete: string[] = [];

  for (const cartItem of cart.cartItems) {
    const product = cartItem.product;

    // If the product no longer exists (i.e., it has been deleted), mark cart item for deletion
    if (!product) {
      this.logger.log(`Product for cart item ${cartItem.id} not found, marking for deletion.`);
      itemsToDelete.push(cartItem.id);
      continue;
    }

    // If the product has product variables, check if the corresponding product variable exists
    if (product.product_variables && product.product_variables.length > 0) {
      const productVariable = product.product_variables.find(
        (variable) => variable.size.toLowerCase() === cartItem.size.trim().toLowerCase(),
      );

      // If no matching product variable is found, mark cart item for deletion
      if (!productVariable) {
        this.logger.log(`Product variable for size "${cartItem.size}" not found, marking for deletion.`);
        itemsToDelete.push(cartItem.id);
      }
    } else {
      // If the product has no product variables, check if the total_quantity is still valid
      if (product.total_quantity <= 0) {
        this.logger.log(`Product quantity is zero or less for product ${product.id}, marking cart item for deletion.`);
        itemsToDelete.push(cartItem.id);
      }
    }
  }

  // Delete invalid cart items
  if (itemsToDelete.length > 0) {
    this.logger.log(`Deleting ${itemsToDelete.length} invalid cart items`);
    await this.cartItemsRepository.delete(itemsToDelete);
  }

  // Reload and return the updated cart with valid items only
  const updatedCart = await this.cartsRepository.findOne({
    where: { id: cart.id },
    relations: ['user', 'cartItems', 'cartItems.product', 'cartItems.product.product_variables'],
  });

  this.logger.log(`Returning updated cart with id ${cart.id}`);
  return updatedCart!;
}

/*------------ Update cart item in cart ------------*/
async updateCartItem(userId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
  this.logger.log(`Updating cart item for userId: ${userId}, cartItemId: ${cartItemId}`);

  // Find the cart item to update
  const cartItem = await this.cartItemsRepository.findOne({
    where: { id: cartItemId },
    relations: ['cart', 'product', 'product.product_variables'],
  });

  if (!cartItem) {
    this.logger.error(`Cart item with id ${cartItemId} not found`);
    throw new NotFoundException(`Cart item with id ${cartItemId} not found`);
  }

  const product = cartItem.product;
  const { quantity, size } = updateCartItemDto;

  // Check if quantity and size are defined
  if (quantity === undefined || size === undefined) {
    this.logger.error(`Quantity or size is undefined for cart item ${cartItemId}`);
    throw new BadRequestException('Quantity and size must be defined');
  }

  // If the product no longer exists, delete the cart item and return the updated cart
  if (!product) {
    this.logger.log(`Product for cart item ${cartItem.id} not found, deleting cart item.`);
    await this.cartItemsRepository.delete(cartItem.id);
    return this.findByUser(userId); // Return updated cart after deletion
  }

  let productVariable: ProductVariable | null = null;

  // If the product has product variables, check if the corresponding product variable exists
  if (product.product_variables && product.product_variables.length > 0) {
    if (product.product_variables.length === 1) {
      // Automatically select the only available size if only one size exists
      productVariable = product.product_variables[0];
      cartItem.size = productVariable.size; // Automatically set the size
    } else {
      // Validate the provided size
      productVariable = product.product_variables.find(variable =>
        variable.size.toLowerCase() === size.trim().toLowerCase()) || null;
      if (!productVariable) {
        this.logger.error(`Size "${size}" not found for product ${product.id}`);
        throw new BadRequestException(`Size "${size}" not available for the product`);
      }
    }
  } else {
    // If no product variants exist, check if size is provided
    if (size) {
      this.logger.error(`Product ${product.id} does not have size variants. Please omit the size.`);
      throw new BadRequestException(`Product does not have size variants. Please provide only quantity.`);
    }
    // Create a dummy ProductVariable if no sizes exist
    productVariable = {
      id: '',
      size: '',
      product: product,
      quantity: product.total_quantity,
      created_at: new Date(),
      updated_at: new Date(),
    } as ProductVariable;
  }

  const availableQuantity = productVariable ? productVariable.quantity : product.total_quantity;

  // Validate quantity
  if (quantity <= 0 || quantity > availableQuantity) {
    const errorMessage = quantity <= 0 ? 'Quantity must be greater than zero' :
      `Requested quantity exceeds available stock for ${productVariable ? `size "${size}"` : 'product'}`;
    this.logger.error(errorMessage);
    throw new BadRequestException(errorMessage);
  }

  // Calculate price (use discounted price if available, otherwise use original price)
  const price = product.discounted_price ?? product.original_price;

  // Check if the cart already contains the item with the same product and size
  const cart = cartItem.cart;  // Access cart directly from cartItem relation

  const existingCartItem = cart.cartItems.find(
    (item) => item.product.id === product.id && item.size === size
  );

  if (existingCartItem) {
    // Log a message for the duplicate item (no merge/update here)
    this.logger.log(`Item with product ${product.id} and size ${size} already exists in the cart, skipping.`);
    throw new BadRequestException(`Item with product ${product.id} and size ${size} already exists in the cart.`);
  }

  // If item does not exist, update the cart item
  cartItem.quantity = quantity;
  cartItem.size = size;
  cartItem.price_at_cart = price * quantity; // Update price based on quantity
  cartItem.product_variable = productVariable

  // Save the updated cart item
  await this.cartItemsRepository.save(cartItem);

  // Return updated cart after cart item update
  return this.findByUser(userId);
}


/*------------ Remove cart item in cart ------------*/
async removeCartItem(userId: string, cartItemId: string): Promise<Cart> {
  this.logger.log(`Removing cart item for userId: ${userId}, cartItemId: ${cartItemId}`);

  // Find the cart item to remove
  const cartItem = await this.cartItemsRepository.findOne({
    where: { id: cartItemId },
    relations: ['cart', 'cart.user', 'product', 'product.product_variables'],
  });

  if (!cartItem) {
    this.logger.error(`Cart item with id ${cartItemId} not found`);
    throw new NotFoundException(`Cart item with id ${cartItemId} not found`);
  }

  // Ensure the cart and the user are linked
  if (!cartItem.cart || !cartItem.cart.user) {
    this.logger.error(`No cart or user associated with cart item ${cartItemId}`);
    throw new NotFoundException(`Cart or user not found for cart item ${cartItemId}`);
  }

  // Validate the cart item belongs to the correct user
  if (cartItem.cart.user.id !== userId) {
    this.logger.error(`Cart item does not belong to user ${userId}`);
    throw new BadRequestException(`This cart item does not belong to user ${userId}`);
  }

  // Remove the cart item from the cart
  await this.cartItemsRepository.remove(cartItem);
  this.logger.log(`Cart item with id ${cartItemId} removed successfully`);

  // Reload and return the updated cart
  const updatedCart = await this.cartsRepository.findOne({
    where: { id: cartItem.cart.id },
    relations: ['user', 'cartItems', 'cartItems.product', 'cartItems.product.product_variables'],
  });

  this.logger.log(`Returning updated cart with id ${cartItem.cart.id}`);
  return updatedCart!;
}



}