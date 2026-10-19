import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryApi, queryKeys } from '@/lib/api/endpoints'

export function useCategories(params) {
  return useQuery({
    queryKey: queryKeys.categories(params),
    queryFn: async () => {
      const res = await categoryApi.list(params)
      return { items: res.data ?? [], meta: res.meta }
    },
    placeholderData: keepPreviousData,
  })
}

export function useCategory(id) {
  return useQuery({
    queryKey: queryKeys.category(id),
    queryFn: async () => (await categoryApi.getById(id)).data,
    enabled: Boolean(id),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => categoryApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoryApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUploadCategoryImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }) => categoryApi.uploadImage(id, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategoryImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoryApi.deleteImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}
