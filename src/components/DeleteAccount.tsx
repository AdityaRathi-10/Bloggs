"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import axios from "axios"
import { Trash2 } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function DeleteAccount() {
    const {data: session} = useSession()
    const router = useRouter()
    
    const handleDeleteAccount = async () => {
        router.replace("/")
        await signOut({
            redirect: false
        })
        const response = await axios.delete(`/api/delete-account/${session?.user._id}`)
        if(!response.data.success) {
            return toast(response.data.message)
        }
        return toast(response.data.message)
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Card className="dark:hover:bg-gray-900 hover:bg-gray-300 cursor-pointer border-gray-600">
                    <CardContent className="text-red-700 dark:text-red-500 flex items-center gap-4">
                        <Trash2 className="w-5 h-5" />
                        <span>Delete account</span>
                    </CardContent>
                </Card>
            </AlertDialogTrigger>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account with all your posts and details.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-700 text-white hover:bg-destructive/90 cursor-pointer">
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}