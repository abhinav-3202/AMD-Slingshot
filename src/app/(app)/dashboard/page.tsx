"use client"

import React from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

const page = () => {
  return (
    <>
      <div>page</div>
      <Button
        className="bg-blue-500 text-white"
        onClick={() => signOut({ callbackUrl: '/signIn' })}
      >
        LogOut
      </Button>
    </>
  )
}

export default page