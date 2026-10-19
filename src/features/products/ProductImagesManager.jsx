import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useConfirm } from '@/components/ui/useConfirm'
import { toastError, toastSuccess } from '@/lib/toast'
import { useDeleteProductImage, useUploadProductImages } from './api'
import { MAX_PRODUCT_IMAGES } from './schema'

/**
 * Upload/remove product imagery. Requires an existing product, because images
 * are attached to a product id by the API.
 */
export function ProductImagesManager({ product }) {
  const { t } = useTranslation()
  const inputRef = useRef(null)
  const upload = useUploadProductImages()
  const removeImage = useDeleteProductImage()
  const [confirm, confirmEl] = useConfirm()

  const id = product._id
  const images = product.images ?? []
  const remaining = MAX_PRODUCT_IMAGES - images.length

  async function handleFiles(event) {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    const formData = new FormData()
    for (const file of files) formData.append('images', file)
    try {
      await upload.mutateAsync({ id, formData })
      toastSuccess(t('products.imagesUploaded'))
    } catch (error) {
      toastError(error, t)
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove(url) {
    const confirmed = await confirm({
      title: t('products.deleteImage'),
      description: t('products.deleteBody', { title: product.title }),
      confirmLabel: t('common.remove'),
    })
    if (!confirmed) return
    try {
      await removeImage.mutateAsync({ id, filename: url.split('/').pop() })
      toastSuccess(t('products.imagesRemoved'))
    } catch (error) {
      toastError(error, t)
    }
  }

  return (
    <div className="space-y-4">
      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('products.imagesEmpty')}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <li key={url} className="group relative overflow-hidden rounded-md border bg-muted">
              <img
                src={url}
                alt={t('products.imageAlt', { title: product.title, index: index + 1 })}
                className="aspect-square w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute end-1 top-1 size-7 opacity-90 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                aria-label={t('products.deleteImage')}
                onClick={() => handleRemove(url)}
                disabled={removeImage.isPending}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending || remaining <= 0}
        >
          {upload.isPending ? <Spinner /> : <ImagePlus className="size-4" aria-hidden="true" />}
          {upload.isPending ? t('common.uploading') : t('common.upload')}
        </Button>
        <span className="text-xs text-muted-foreground">
          {t('products.imagesHint', { current: images.length, max: MAX_PRODUCT_IMAGES })}
        </span>
      </div>

      {confirmEl}
    </div>
  )
}
