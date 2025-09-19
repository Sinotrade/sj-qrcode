import { useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Toaster, toast } from 'sonner'
import {
  QrCode,
  Loader2,
  Copy,
  Download,
  RefreshCcw,
  ShieldCheck,
  FileDown,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: '請輸入使用者名稱' })
    .max(120, { message: '名稱長度請少於 120 字' }),
  apiKey: z
    .string()
    .trim()
    .min(1, { message: '請輸入 SJ_API_KEY' })
    .max(256, { message: 'API Key 長度過長' }),
  secKey: z
    .string()
    .trim()
    .min(1, { message: '請輸入 SJ_SEC_KEY' })
    .max(256, { message: 'SEC Key 長度過長' }),
})

type FormValues = z.infer<typeof formSchema>

type Payload = {
  NAME: string
  SJ_API_KEY: string
  SJ_SEC_KEY: string
}

const formatFileNameSegment = (input: string) => {
  const trimmed = input.trim()
  if (!trimmed) return 'anon'
  const normalized = trimmed.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '')
  return normalized || 'anon'
}

const createLabeledQr = async (text: string, displayName: string) => {
  const qrSize = 320
  const qrCanvas = document.createElement('canvas')

  await new Promise<void>((resolve, reject) => {
    QRCode.toCanvas(
      qrCanvas,
      text,
      {
        errorCorrectionLevel: 'M',
        width: qrSize,
        margin: 1,
        color: {
          dark: '#030712',
          light: '#ffffff',
        },
      },
      (error) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      },
    )
  })

  const horizontalPadding = 32
  const topPadding = 42
  const titleFontSize = 22
  const titleSpacing = 10
  const nameFontSize = 18
  const nameSpacing = 20
  const footerPadding = 42

  const canvas = document.createElement('canvas')
  canvas.width = qrSize + horizontalPadding * 2
  canvas.height =
    topPadding +
    titleFontSize +
    titleSpacing +
    nameFontSize +
    nameSpacing +
    qrSize +
    footerPadding

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('無法建立畫布內容')
  }

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#0f172a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  const centerX = canvas.width / 2
  const titleY = topPadding
  ctx.font = `700 ${titleFontSize}px "Inter", "Noto Sans", "Helvetica Neue", Arial, sans-serif`
  ctx.fillText('SHIOAJI API QRCODE', centerX, titleY)

  const nameY = titleY + titleFontSize + titleSpacing
  ctx.font = `500 ${nameFontSize}px "Inter", "Noto Sans", "Helvetica Neue", Arial, sans-serif`
  ctx.fillText(`NAME: ${displayName || '未命名'}`, centerX, nameY)

  const qrY = nameY + nameFontSize + nameSpacing
  ctx.drawImage(qrCanvas, horizontalPadding, qrY, qrSize, qrSize)

  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  ctx.strokeRect(horizontalPadding - 1, qrY - 1, qrSize + 2, qrSize + 2)

  ctx.font = '400 12px "Inter", "Noto Sans", "Helvetica Neue", Arial, sans-serif'
  ctx.fillStyle = '#6b7280'
  ctx.fillText(
    'https://sinotrade.github.io/sj-qrcode/',
    centerX,
    canvas.height - footerPadding + 12,
  )

  return canvas.toDataURL('image/png')
}

function App() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', apiKey: '', secKey: '' },
    mode: 'onBlur',
  })

  const [jsonPayload, setJsonPayload] = useState<string>('')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

  const hasResult = useMemo(() => Boolean(jsonPayload && qrCodeDataUrl), [
    jsonPayload,
    qrCodeDataUrl,
  ])

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: Payload = {
      NAME: values.name,
      SJ_API_KEY: values.apiKey,
      SJ_SEC_KEY: values.secKey,
    }

    const formatted = JSON.stringify(payload, null, 2)

    try {
      const dataUrl = await QRCode.toDataURL(formatted, {
        errorCorrectionLevel: 'M',
        width: 320,
        margin: 1,
        color: {
          dark: '#030712',
          light: '#ffffff',
        },
      })

      setJsonPayload(formatted)
      setQrCodeDataUrl(dataUrl)
      toast.success('QR code 已完成')
    } catch (error) {
      console.error('Failed to generate QR code', error)
      toast.error('產生 QR code 時發生錯誤，請稍後再試')
    }
  })

  const handleCopyJson = async () => {
    if (!jsonPayload) {
      toast.error('尚未生成 JSON 資料')
      return
    }

    try {
      await navigator.clipboard.writeText(jsonPayload)
      toast.success('JSON 已複製到剪貼簿')
    } catch (error) {
      console.error('Clipboard copy failed', error)
      toast.error('複製失敗，請手動複製')
    }
  }

  const handleDownloadQr = async () => {
    if (!jsonPayload) {
      toast.error('尚未生成 QR code')
      return
    }

    try {
      const displayName = form.getValues('name')?.trim() || '未命名'
      const labeledQr = await createLabeledQr(jsonPayload, displayName)

      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-').slice(0, 19)
      const normalizedName = formatFileNameSegment(displayName)
      link.href = labeledQr
      link.download = `sj-token-${normalizedName}-${timestamp}.png`
      link.click()

      toast.success('QR code 已開始下載')
    } catch (error) {
      console.error('Failed to export labeled QR code', error)
      toast.error('下載 QR code 時發生錯誤')
    }
  }

  const handleDownloadJson = () => {
    if (!jsonPayload) {
      toast.error('尚未生成 JSON 資料')
      return
    }

    const normalizedName = formatFileNameSegment(form.getValues('name') ?? '')
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-').slice(0, 19)
    const blob = new Blob([jsonPayload], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sj-token-${normalizedName}-${timestamp}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast.success('JSON 檔案已開始下載')
  }

  const handleReset = () => {
    form.reset()
    setJsonPayload('')
    setQrCodeDataUrl('')
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors closeButton position="top-right" />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pb-16 pt-10">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            SHIOAJI QR Code 生成器
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            輸入名稱與 SHIOAJI API 認證資訊，快速生成帶有 JSON 資料的 QR code。
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>輸入資料</CardTitle>
              <CardDescription>填寫後點擊生成即可取得 JSON 與 QR code。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <ShieldCheck className="h-5 w-5" />
                <AlertTitle>安全提醒</AlertTitle>
                <AlertDescription>
                  請確認目前網址為
                  <a
                    href="https://sinotrade.github.io/sj-qrcode/"
                    target="_blank"
                    rel="noreferrer"
                    className="mx-1 underline underline-offset-4"
                  >
                    sinotrade.github.io/sj-qrcode/
                  </a>
                  並在安全環境操作，避免將 API Key 透露給未授權的第三方。
                </AlertDescription>
              </Alert>

              <Form {...form}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NAME</FormLabel>
                        <FormControl>
                          <Input placeholder="例如：SJ 團隊" autoComplete="off" {...field} />
                        </FormControl>
                        <FormDescription>使用者或應用程式的識別名稱。</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SHIOAJI_API_KEY</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="請輸入提供的 API Key"
                            type="password"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          會轉換成 QR code，請確認大小寫正確。
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SHIOAJI_SEC_KEY</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="請輸入提供的 Secret Key"
                            type="password"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          與 API Key 搭配使用的密鑰，僅用於本地生成。
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-3 sm:grid-cols-[1.2fr,auto]">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <QrCode className="mr-2 h-4 w-4" />
                      )}
                      生成 QR code
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={form.formState.isSubmitting && !hasResult}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />重設
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>QR code 與 JSON 結果</CardTitle>
              <CardDescription>生成後可直接掃描 QR code 並複製 JSON 字串。</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 lg:h-[600px]">
              <div className="flex flex-col gap-2 lg:flex-[1.5]">
                <Separator className="mb-1 lg:mb-1.5" />
                {hasResult ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={qrCodeDataUrl}
                      alt="SJ QR code"
                      className="h-auto w-60 rounded border bg-white p-2 shadow"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full max-w-xs"
                      disabled={!qrCodeDataUrl}
                      onClick={handleDownloadQr}
                    >
                      <Download className="mr-2 h-4 w-4" />下載 QR code
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      如果顯示模糊，請再試一次或提高螢幕亮度後掃描。
                    </p>
                  </div>
                ) : (
                  <div className="flex h-52 items-center justify-center rounded-lg border border-dashed">
                    <p className="px-6 text-center text-sm text-muted-foreground">
                      生成結果後會顯示 QR code 預覽。
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex flex-col gap-3 lg:flex-[1.05]">
                <p className="text-sm font-medium text-muted-foreground">JSON 資料</p>
                <Textarea
                  value={jsonPayload}
                  readOnly
                  placeholder="完成表單後會自動生成 JSON 資料"
                  wrap="off"
                  spellCheck={false}
                  rows={5}
                  className="resize-y overflow-auto font-mono text-sm leading-relaxed lg:h-full lg:min-h-0"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-center gap-3 pb-4 pt-0">
              <Button
                type="button"
                variant="secondary"
                disabled={!jsonPayload}
                onClick={handleCopyJson}
              >
                <Copy className="mr-2 h-4 w-4" />複製 JSON
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!jsonPayload}
                onClick={handleDownloadJson}
              >
                <FileDown className="mr-2 h-4 w-4" />下載 JSON
              </Button>
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default App
