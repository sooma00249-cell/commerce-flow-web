import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productApi, queryKeys } from '@/lib/api/endpoints'

export function useProducts(params) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: async () => {
      const res = await productApi.list(params)
      return { items: res.data ?? [], meta: res.meta }
    },
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: async () => (await productApi.getById(id)).data,
    enabled: Boolean(id),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => productApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUploadProductImages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }) => productApi.uploadImages(id, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, filename }) => productApi.deleteImage(id, filename),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}
