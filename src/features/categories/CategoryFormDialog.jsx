import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Tag, Trash2, Upload, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { TextField, TextareaField } from '@/components/form/FormField'
import { applyApiErrors } from '@/components/form/useApiFormErrors'
import { useConfirm } from '@/components/ui/useConfirm'
import { toastError, toastSuccess } from '@/lib/toast'
import {
  useCreateCategory,
  useDeleteCategoryImage,
  useUpdateCategory,
  useUploadCategoryImage,
} from './api'
import { categoryDefaults, categorySchema, slugify } from './schema'

function CategoryForm({ category, onOpenChange }) {
  const { t } = useTranslation()
  const isEdit = Boolean(category)

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const uploadImage = useUploadCategoryImage()
  const deleteImage = useDeleteCategoryImage()
  const [confirm, confirmEl] = useConfirm()

  const imageInputRef = useRef(null)
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [draftKey, setDraftKey] = useState('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: categoryDefaults(category),
  })

  const specKeys = watch('specKeys') ?? []

  function addSpecKey() {
    const value = draftKey.trim()
    if (!value) return
    setDraftKey('')
    if (specKeys.includes(value)) return
    setValue('specKeys', [...specKeys, value], { shouldDirty: true })
  }

  function removeSpecKey(key) {
    setValue(
      'specKeys',
      specKeys.filter((item) => item !== key),
      { shouldDirty: true },
    )
  }

  async function handleImageFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    try {
      await uploadImage.mutateAsync({ id: category._id, formData })
      toastSuccess(t('common.updated'))
    } catch (error) {
      toastError(error, t)
    } finally {
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  async function handleRemoveImage() {
    const confirmed = await confirm({
      title: t('common.remove'),
      description: category.title,
      confirmLabel: t('common.remove'),
    })
    if (!confirmed) return
    try {
      await deleteImage.mutateAsync(category._id)
      toastSuccess(t('common.updated'))
    } catch (error) {
      toastError(error, t)
    }
  }

  async function onSubmit(values) {
    const payload = {
      title: values.title,
      slug: values.slug,
      description: values.description ?? '',
      isActive: values.isActive,
      specKeys: values.specKeys ?? [],
    }
    try {
      if (isEdit) {
        await updateCategory.mutateAsync({ id: category._id, data: payload })
        toastSuccess(t('categories.updated'))
      } else {
        await createCategory.mutateAsync(payload)
        toastSuccess(t('categories.created'))
      }
      onOpenChange(false)
    } catch (error) {
      if (!applyApiErrors(error, setError, clearErrors)) toastError(error, t)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{isEdit ? t('categories.edit') : t('categories.new')}</DialogTitle>
        <DialogDescription>{t('categories.subtitle')}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t('categories.fields.title')}
          required
          placeholder={t('categories.fields.titlePlaceholder')}
          {...register('title', {
            onChange: (event) => {
              if (!isEdit && !slugTouched) {
                setValue('slug', slugify(event.target.value), { shouldDirty: true })
              }
            },
          })}
          error={errors.title?.message && t(errors.title.message)}
        />
        <TextField
          label={t('categories.fields.slug')}
          required
          hint={t('categories.fields.slugHint')}
          placeholder={t('categories.fields.slugPlaceholder')}
          {...register('slug', { onChange: () => setSlugTouched(true) })}
          error={errors.slug?.message && t(errors.slug.message)}
        />
      </div>

      <TextareaField
        label={t('categories.fields.description')}
        rows={2}
        {...register('description')}
      />

      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-between gap-4 rounded-md border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="category-active">{t('categories.fields.isActive')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('categories.fields.isActiveHint')}
              </p>
            </div>
            <Switch
              id="category-active"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={field.disabled}
            />
          </div>
        )}
      />

      <div className="space-y-2">
        <Label htmlFor="category-spec-key">{t('categories.fields.specKeys')}</Label>
        {specKeys.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {specKeys.map((key) => (
              <Badge key={key} variant="secondary" className="gap-1">
                {key}
                <button
                  type="button"
                  onClick={() => removeSpecKey(key)}
                  aria-label={t('categories.fields.removeSpecKey', { key })}
                  className="rounded-full outline-none hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="flex gap-2">
          <Input
            id="category-spec-key"
            value={draftKey}
            onChange={(event) => setDraftKey(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addSpecKey()
              }
            }}
            placeholder={t('categories.fields.specKeysPlaceholder')}
          />
          <Button type="button" variant="outline" onClick={addSpecKey}>
            {t('categories.fields.addSpecKey')}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{t('categories.fields.specKeysHint')}</p>
      </div>

      {isEdit ? (
        <div className="space-y-2">
          <Label>{t('categories.fields.image')}</Label>
          <div className="flex flex-wrap items-center gap-3">
            {category.image ? (
              <img
                src={category.image}
                alt={t('categories.fields.imageAlt', { title: category.title })}
                className="size-16 rounded-md border bg-muted object-cover"
              />
            ) : (
              <span className="flex size-16 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                <Tag className="size-5" aria-hidden="true" />
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadImage.isPending}
              >
                {uploadImage.isPending ? <Spinner /> : <Upload className="size-4" aria-hidden="true" />}
                {t('common.upload')}
              </Button>
              {category.image ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={deleteImage.isPending}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  {t('common.remove')}
                </Button>
              ) : null}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageFile}
            />
          </div>
        </div>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null}
          {isEdit ? t('common.save') : t('common.create')}
        </Button>
      </DialogFooter>

      {confirmEl}
    </form>
  )
}

export function CategoryFormDialog({ open, onOpenChange, category }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] max-w-xl overflow-y-auto">
        <CategoryForm category={category} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  )
}
