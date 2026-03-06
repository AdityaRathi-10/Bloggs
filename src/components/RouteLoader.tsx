"use client"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Loading from "./Loading"

export default function RouteLoader({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const handleStart = () => setLoading(true)
        const handleComplete = () => setLoading(false)

        // PATCH: AppRouter doesn’t have .events, but we can use beforePopState or intercept
        const push = router.push
        router.push = async (...args) => {
            handleStart()
            const res = await push(...args)
            handleComplete()
            return res
        }

        return () => {
            router.push = push
        }
    }, [router])

    return (
        <>
            {loading && <Loading />}
            {children}
        </>
    )
}