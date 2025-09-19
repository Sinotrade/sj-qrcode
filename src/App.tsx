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

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) {
      toast.error('尚未生成 QR code')
      return
    }

    const link = document.createElement('a')
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-').slice(0, 19)
    link.href = qrCodeDataUrl
    link.download = `sj-config-${timestamp}.png`
    link.click()

    toast.success('QR code 已開始下載')
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
                  請確認網址已在安全環境操作，避免將 API Key 透露給未授權的第三方。
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
            <CardContent className="flex flex-col gap-6 lg:h-[560px]">
              <div className="flex flex-col gap-4 lg:flex-[2]">
                <Separator className="mb-2 lg:mb-4" />
                {hasResult ? (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={qrCodeDataUrl}
                      alt="SJ QR code"
                      className="h-auto w-52 rounded border bg-white p-3 shadow"
                    />
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

              <div className="flex flex-col gap-4 lg:flex-[1]">
                <p className="text-sm font-medium text-muted-foreground">JSON 資料</p>
                <Textarea
                  value={jsonPayload}
                  readOnly
                  placeholder="完成表單後會自動生成 JSON 資料"
                  className="min-h-[160px] font-mono text-sm lg:h-full lg:min-h-0"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
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
                disabled={!qrCodeDataUrl}
                onClick={handleDownloadQr}
              >
                <Download className="mr-2 h-4 w-4" />下載 QR code
              </Button>
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default App
