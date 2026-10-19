/** Mongoose serializes ids as `_id`; tolerate a plain `id` too. */
export function entityId(entity) {
  return entity?._id ?? entity?.id ?? null
}
