import React from "react"
import { LoadingButton } from "@mui/lab"

export default function NextButton(props: any) {
  return (
    <LoadingButton
      {...props}
      variant="contained"
      sx={{ mt: 8, pl: 8, pr: 8 }}
    >
      Next
    </LoadingButton>
  )
}
