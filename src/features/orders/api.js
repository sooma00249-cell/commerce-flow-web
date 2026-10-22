import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { purchaseOrderApi, queryKeys, saleOrderApi } from '@/lib/api/endpoints'

/* ------------------------------------------------------------------ sale */

export function useSaleOrders(params) {
  return useQuery({
    queryKey: queryKeys.saleOrders(params),
    queryFn: async () => {
      const res = await saleOrderApi.list(params)
      return { items: res.data ?? [], meta: res.meta }
    },
    placeholderData: keepPreviousData,
  })
}

export function useSaleOrder(id) {
  return useQuery({
    queryKey: queryKeys.saleOrder(id),
    queryFn: async () => (await saleOrderApi.getById(id)).data,
    enabled: Boolean(id),
  })
}

export function useCreateSaleOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saleOrderApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sale-orders'] }),
  })
}

export function useUpdateSaleOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => saleOrderApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sale-orders'] }),
  })
}

/* -------------------------------------------------------------- purchase */

export function usePurchaseOrders(params) {
  return useQuery({
    queryKey: queryKeys.purchaseOrders(params),
    queryFn: async () => {
      const res = await purchaseOrderApi.list(params)
      return { items: res.data ?? [], meta: res.meta }
    },
    placeholderData: keepPreviousData,
  })
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: purchaseOrderApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }),
  })
}

export function useUpdatePurchaseOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => purchaseOrderApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }),
  })
}
