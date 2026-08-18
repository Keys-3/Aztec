# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateUser, useCreateCartItem, useCreateOrder, useCreateOrderItem, useCreateProduct, useUpdateUser, useUpdateCart, useUpdateOrder, useUpdateProduct, useDeleteUser } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateUser();

const { data, isPending, isSuccess, isError, error } = useCreateCartItem(createCartItemVars);

const { data, isPending, isSuccess, isError, error } = useCreateOrder(createOrderVars);

const { data, isPending, isSuccess, isError, error } = useCreateOrderItem(createOrderItemVars);

const { data, isPending, isSuccess, isError, error } = useCreateProduct(createProductVars);

const { data, isPending, isSuccess, isError, error } = useUpdateUser(updateUserVars);

const { data, isPending, isSuccess, isError, error } = useUpdateCart(updateCartVars);

const { data, isPending, isSuccess, isError, error } = useUpdateOrder(updateOrderVars);

const { data, isPending, isSuccess, isError, error } = useUpdateProduct(updateProductVars);

const { data, isPending, isSuccess, isError, error } = useDeleteUser();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, createCartItem, createOrder, createOrderItem, createProduct, updateUser, updateCart, updateOrder, updateProduct, deleteUser } from '@dataconnect/generated';


// Operation CreateUser: 
const { data } = await CreateUser(dataConnect);

// Operation CreateCartItem:  For variables, look at type CreateCartItemVars in ../index.d.ts
const { data } = await CreateCartItem(dataConnect, createCartItemVars);

// Operation CreateOrder:  For variables, look at type CreateOrderVars in ../index.d.ts
const { data } = await CreateOrder(dataConnect, createOrderVars);

// Operation CreateOrderItem:  For variables, look at type CreateOrderItemVars in ../index.d.ts
const { data } = await CreateOrderItem(dataConnect, createOrderItemVars);

// Operation CreateProduct:  For variables, look at type CreateProductVars in ../index.d.ts
const { data } = await CreateProduct(dataConnect, createProductVars);

// Operation UpdateUser:  For variables, look at type UpdateUserVars in ../index.d.ts
const { data } = await UpdateUser(dataConnect, updateUserVars);

// Operation UpdateCart:  For variables, look at type UpdateCartVars in ../index.d.ts
const { data } = await UpdateCart(dataConnect, updateCartVars);

// Operation UpdateOrder:  For variables, look at type UpdateOrderVars in ../index.d.ts
const { data } = await UpdateOrder(dataConnect, updateOrderVars);

// Operation UpdateProduct:  For variables, look at type UpdateProductVars in ../index.d.ts
const { data } = await UpdateProduct(dataConnect, updateProductVars);

// Operation DeleteUser: 
const { data } = await DeleteUser(dataConnect);


```