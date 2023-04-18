import React from "react"
import { Button } from "@mui/material"

export default function NextButton(props: any) {
  return (
    <Button
      sx={{ mt: 8, mr: 2 }}
      {...props}
    >
      Back
    </Button>
  )
}
