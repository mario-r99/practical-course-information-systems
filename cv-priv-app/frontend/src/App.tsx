import React, { useState } from "react"
import { processRelatedData } from "./utils/processRelatedData"
import axios from "axios"
import {
  CssBaseline,
  Container,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Collapse,
  Alert,
  IconButton
} from "@mui/material"
import CloseIcon from '@mui/icons-material/Close'
import { ThemeProvider } from "@mui/material/styles"
import useMediaQuery from '@mui/material/useMediaQuery'
import { darkTheme } from "./themes/darkTheme"
import { lightTheme } from "./themes/lightTheme"
import EntitiesPage from "./pages/EntitiesPage"
import RelatedDataPage from "./pages/RelatedDataPage"
import PETResultPage from "./pages/PETResultPage"
import BackButton from "./components/BackButton"
import NextButton from "./components/NextButton"
import "./App.css"
import { sliceURI } from "./utils/sliceURI"

export default function App() {

  // Set page states
  const stepLabels = ['Select Entities', 'Related Data', 'PET Result']
  const [activeStep, setActiveStep] = useState(0)

  // Next button loading state and error alert
  const [buttonLoading, setButtonLoading] = useState(false)
  const [errorOpen, setErrorOpen] = useState(false)
  const [errorCode, setErrorCode] = useState("")
  const [initialForm, setInitialForm] = useState(true)

  // Selected Entities
  const [data, setData] = useState<string[]>([])
  const [service, setService] = useState<string | null>(null)
  const [situation, setSituation] = useState<string | null>(null)

  // Functions to set selected entities
  const handleData = (value: any) => setData(value)
  const handleService = (value: any) => setService(value)
  const handleSituation = (value: any) => setSituation(value)

  // Related Data and checked related data
  const [relatedData, setRelatedData] = useState<string[]>([])
  const [checkedRelatedData, setCheckedRelatedData] = useState<string[]>([])
  const handleCheckedRelatedData = (value: any) => setCheckedRelatedData(value)

  // PET Results
  const [PETResults, setPETResults] = useState<any[]>([])

  // Other configuration (API config, app theme)
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const requestOptions = {
    headers: { "Content-Type": "application/json" },
  }

  // Get the content of the current step
  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return <EntitiesPage
          entities={{ "data": data, "service": service, "situation": situation }}
          handleData={handleData}
          handleService={handleService}
          handleSituation={handleSituation}
          requestOptions={requestOptions}
          initialForm={initialForm}
        />
      case 1:
        return <RelatedDataPage
          relatedData={relatedData}
          checkedRelatedData={checkedRelatedData}
          handleCheckedRelatedData={handleCheckedRelatedData}
        />
      case 2:
        return <PETResultPage
          PETResults={PETResults}
        />
      default:
        throw new Error("Unknown switch step")
    }
  }

  // Check if all required form fields are filled
  const checkForm = () => {
    if (service && data.length > 0) return true
    else return false
  }

  // Actions on back button click
  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  // Actions on next button click
  const handleNext = () => {
    setErrorOpen(false)
    if (activeStep !== 0 || checkForm()) {
      console.log("Form filled")
      setButtonLoading(true)
      const [path, payload] = getPostData()
      console.log(`POST payload for step ${activeStep + 1}:`)
      console.log(payload)
      axios.post("/" + path, payload, requestOptions)
        .then(processResponse)
        .catch((error: any) => {
          console.log(error)
          setErrorCode(`${error.response.status} - ${error.response.statusText}`)
          setErrorOpen(true)
        })
        .finally(() => {
          setButtonLoading(false)
        })
    }
    else {
      console.log("Form not filled")
      setInitialForm(false)
    }
  }

  // Get data for post request for next step
  const getPostData = () => {
    switch (activeStep) {
      case 0:
        const selectedEntities = {
          "data": data,
          "service": service,
          "situation": situation
        }
        return ["sparqlEntities", selectedEntities]
      case 1:
        const relatedDataPayload = {
          "selectedData": checkedRelatedData,
          "service": service
        }
        return ["sparqlExtendedPET", relatedDataPayload]
      default:
        throw new Error("Unknown POST step")
    }
  }

  // Process the response from any page step
  const processResponse = (response: any) => {
    const responseData = response.data
    console.log(`Response data for step ${activeStep + 1}:`)
    console.log(responseData)
    switch (activeStep) {
      case 0:
        const processedData = processRelatedData(responseData)
        setRelatedData(processedData)
        setCheckedRelatedData(data)
        setActiveStep(activeStep + 1)
        return
      case 1:
        const processedPETs = responseData.combinations.map(
          (PETCombination: any) => PETCombination.map(
            (PET: any) => {
              const PETName: string = sliceURI(Object.keys(PET)[0])
              const PETValues: any = Object.values(PET)[0]
              const dataType: string = sliceURI(PETValues.hasInput)
              const bruhKey = sliceURI(Object.keys(PETValues)[1])
              const bruhValue = Object.values(PETValues)[1]
              return {
                "name": PETName,
                "dataType": dataType,
                "slaAttribute": bruhKey,
                "slaValue": bruhValue
              }
            }
          )
        )
        console.log("Processed PETs:")
        console.log(processedPETs)
        setPETResults(processedPETs)
        setActiveStep(activeStep + 1)
        return
      default:
        throw new Error("Unknown response step")
    }
  }

  // Render the display
  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h1">
          Privacy Configurator
        </Typography>
        <Typography component="h1" variant="h2" mt={1} mb={2}>
          for Connected Vehicles
        </Typography>
        <Container component="main" maxWidth="md">

          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5, width: 1 }}>
            {stepLabels.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {getStepContent()}
          <Box textAlign='center'>
            {activeStep !== 0 && <BackButton onClick={handleBack} />}
            {activeStep < stepLabels.length - 1 && <NextButton onClick={handleNext} loading={buttonLoading} />}
          </Box>
          <Collapse in={errorOpen}>
            <Alert
              variant="outlined"
              severity="error"
              action={
                <IconButton
                  size="small"
                  onClick={() => {
                    setErrorOpen(false)
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mt: 2 }}
            >
              The server encountered an error: {errorCode}
            </Alert>
          </Collapse>

        </Container>
      </Box>
    </ThemeProvider >
  )
}
