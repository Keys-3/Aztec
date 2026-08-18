import { CreateUserData, CreateCartItemData, CreateCartItemVariables, CreateOrderData, CreateOrderVariables, CreateOrderItemData, CreateOrderItemVariables, CreateProductData, CreateProductVariables, UpdateUserData, UpdateUserVariables, UpdateCartData, UpdateCartVariables, UpdateOrderData, UpdateOrderVariables, UpdateProductData, UpdateProductVariables, DeleteUserData, DeleteCartData, DeleteCartVariables, DeleteOrderData, DeleteOrderVariables, DeleteOrderItemData, DeleteOrderItemVariables, DeleteProductData, DeleteProductVariables, GetMyUserData, GetCartData, GetCartVariables, GetOrderData, GetOrderVariables, ListProductsData, ListMyOrdersData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useCreateCartItem(options?: useDataConnectMutationOptions<CreateCartItemData, FirebaseError, CreateCartItemVariables>): UseDataConnectMutationResult<CreateCartItemData, CreateCartItemVariables>;
export function useCreateCartItem(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCartItemData, FirebaseError, CreateCartItemVariables>): UseDataConnectMutationResult<CreateCartItemData, CreateCartItemVariables>;

export function useCreateOrder(options?: useDataConnectMutationOptions<CreateOrderData, FirebaseError, CreateOrderVariables>): UseDataConnectMutationResult<CreateOrderData, CreateOrderVariables>;
export function useCreateOrder(dc: DataConnect, options?: useDataConnectMutationOptions<CreateOrderData, FirebaseError, CreateOrderVariables>): UseDataConnectMutationResult<CreateOrderData, CreateOrderVariables>;

export function useCreateOrderItem(options?: useDataConnectMutationOptions<CreateOrderItemData, FirebaseError, CreateOrderItemVariables>): UseDataConnectMutationResult<CreateOrderItemData, CreateOrderItemVariables>;
export function useCreateOrderItem(dc: DataConnect, options?: useDataConnectMutationOptions<CreateOrderItemData, FirebaseError, CreateOrderItemVariables>): UseDataConnectMutationResult<CreateOrderItemData, CreateOrderItemVariables>;

export function useCreateProduct(options?: useDataConnectMutationOptions<CreateProductData, FirebaseError, CreateProductVariables>): UseDataConnectMutationResult<CreateProductData, CreateProductVariables>;
export function useCreateProduct(dc: DataConnect, options?: useDataConnectMutationOptions<CreateProductData, FirebaseError, CreateProductVariables>): UseDataConnectMutationResult<CreateProductData, CreateProductVariables>;

export function useUpdateUser(options?: useDataConnectMutationOptions<UpdateUserData, FirebaseError, UpdateUserVariables | void>): UseDataConnectMutationResult<UpdateUserData, UpdateUserVariables>;
export function useUpdateUser(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserData, FirebaseError, UpdateUserVariables | void>): UseDataConnectMutationResult<UpdateUserData, UpdateUserVariables>;

export function useUpdateCart(options?: useDataConnectMutationOptions<UpdateCartData, FirebaseError, UpdateCartVariables>): UseDataConnectMutationResult<UpdateCartData, UpdateCartVariables>;
export function useUpdateCart(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateCartData, FirebaseError, UpdateCartVariables>): UseDataConnectMutationResult<UpdateCartData, UpdateCartVariables>;

export function useUpdateOrder(options?: useDataConnectMutationOptions<UpdateOrderData, FirebaseError, UpdateOrderVariables>): UseDataConnectMutationResult<UpdateOrderData, UpdateOrderVariables>;
export function useUpdateOrder(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateOrderData, FirebaseError, UpdateOrderVariables>): UseDataConnectMutationResult<UpdateOrderData, UpdateOrderVariables>;

export function useUpdateProduct(options?: useDataConnectMutationOptions<UpdateProductData, FirebaseError, UpdateProductVariables>): UseDataConnectMutationResult<UpdateProductData, UpdateProductVariables>;
export function useUpdateProduct(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateProductData, FirebaseError, UpdateProductVariables>): UseDataConnectMutationResult<UpdateProductData, UpdateProductVariables>;

export function useDeleteUser(options?: useDataConnectMutationOptions<DeleteUserData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserData, undefined>;
export function useDeleteUser(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteUserData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserData, undefined>;

export function useDeleteCart(options?: useDataConnectMutationOptions<DeleteCartData, FirebaseError, DeleteCartVariables>): UseDataConnectMutationResult<DeleteCartData, DeleteCartVariables>;
export function useDeleteCart(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteCartData, FirebaseError, DeleteCartVariables>): UseDataConnectMutationResult<DeleteCartData, DeleteCartVariables>;

export function useDeleteOrder(options?: useDataConnectMutationOptions<DeleteOrderData, FirebaseError, DeleteOrderVariables>): UseDataConnectMutationResult<DeleteOrderData, DeleteOrderVariables>;
export function useDeleteOrder(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteOrderData, FirebaseError, DeleteOrderVariables>): UseDataConnectMutationResult<DeleteOrderData, DeleteOrderVariables>;

export function useDeleteOrderItem(options?: useDataConnectMutationOptions<DeleteOrderItemData, FirebaseError, DeleteOrderItemVariables>): UseDataConnectMutationResult<DeleteOrderItemData, DeleteOrderItemVariables>;
export function useDeleteOrderItem(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteOrderItemData, FirebaseError, DeleteOrderItemVariables>): UseDataConnectMutationResult<DeleteOrderItemData, DeleteOrderItemVariables>;

export function useDeleteProduct(options?: useDataConnectMutationOptions<DeleteProductData, FirebaseError, DeleteProductVariables>): UseDataConnectMutationResult<DeleteProductData, DeleteProductVariables>;
export function useDeleteProduct(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteProductData, FirebaseError, DeleteProductVariables>): UseDataConnectMutationResult<DeleteProductData, DeleteProductVariables>;

export function useGetMyUser(options?: useDataConnectQueryOptions<GetMyUserData>): UseDataConnectQueryResult<GetMyUserData, undefined>;
export function useGetMyUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyUserData>): UseDataConnectQueryResult<GetMyUserData, undefined>;

export function useGetCart(vars: GetCartVariables, options?: useDataConnectQueryOptions<GetCartData>): UseDataConnectQueryResult<GetCartData, GetCartVariables>;
export function useGetCart(dc: DataConnect, vars: GetCartVariables, options?: useDataConnectQueryOptions<GetCartData>): UseDataConnectQueryResult<GetCartData, GetCartVariables>;

export function useGetOrder(vars: GetOrderVariables, options?: useDataConnectQueryOptions<GetOrderData>): UseDataConnectQueryResult<GetOrderData, GetOrderVariables>;
export function useGetOrder(dc: DataConnect, vars: GetOrderVariables, options?: useDataConnectQueryOptions<GetOrderData>): UseDataConnectQueryResult<GetOrderData, GetOrderVariables>;

export function useListProducts(options?: useDataConnectQueryOptions<ListProductsData>): UseDataConnectQueryResult<ListProductsData, undefined>;
export function useListProducts(dc: DataConnect, options?: useDataConnectQueryOptions<ListProductsData>): UseDataConnectQueryResult<ListProductsData, undefined>;

export function useListMyOrders(options?: useDataConnectQueryOptions<ListMyOrdersData>): UseDataConnectQueryResult<ListMyOrdersData, undefined>;
export function useListMyOrders(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyOrdersData>): UseDataConnectQueryResult<ListMyOrdersData, undefined>;
