import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { queryKeys, userApi } from '@/lib/api/endpoints'

/** Paginated user list — used by the administration screens and the order forms. */
export function useUsers(params, options = {}) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: async () => {
      const res = await userApi.list(params)
      return { items: res.data ?? [], meta: res.meta }
    },
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  })
}
