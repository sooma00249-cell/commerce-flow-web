import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys, supplierApi } from '@/lib/api/endpoints'

export function useSuppliers(params) {
  return useQuery({
    queryKey: queryKeys.suppliers(params),
    queryFn: async () => {
      const res = await supplierApi.list(params)
      return { items: res.data ?? [], meta: res.meta }
    },
    placeholderData: keepPreviousData,
  })
}

export function useSupplier(id) {
  return useQuery({
    queryKey: queryKeys.supplier(id),
    queryFn: async () => (await supplierApi.getById(id)).data,
    enabled: Boolean(id),
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: supplierApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => supplierApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: supplierApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}
