import React, { useState, useEffect } from "react"
import axios from "axios"
import { sliceURI } from "../utils/sliceURI"
import { friendlyName } from "../utils/friendlyName"
import {
  Grid,
  Box,
  Typography,
  FormControl,
  Autocomplete,
  TextField
} from "@mui/material"

export default function EntitiesPage({ entities, handleData, handleService, handleSituation, requestOptions, initialForm }: any) {

  // Available Entities to be selected
  const [dataList, setDataList] = useState<string[]>([])
  const [dependencies, setDependencies] = useState<any>({})
  const [serviceList, setServiceList] = useState<string[]>([])
  const [situationList, setSituationList] = useState<string[]>([])

  const disableOptions = (option: string) => {
    // Check if service is selected, otherwise enable all data options
    if (entities.service) {
      if (dependencies[entities.service].includes(option)) {
        console.log(`Found option ${option} in ${entities.service}`)
        return false
      }
      else {
        console.log("Option not found -> disabling entry")
        return true
      }
    }
    else {
      console.log("No service selected -> enabling all data options")
      return false
    }
  }

  // Filter multiple entities out of a list
  const filterMultiple = (list: string[]) => {
    return list.filter((item: string, index: number) =>
      list.indexOf(item) === index
    )
  }

  // Get the initial entities for the autocomplete components
  useEffect(() => {
    axios.get("/initSparqlPreparation", requestOptions).then(
      (response) => {
        console.log("HTTP response:")
        console.log(response)

        // Map entities from URI string to entity list
        const dataBindings = response.data.data.results.bindings
        const serviceBindings = response.data.service.results.bindings
        const situationBindings = response.data.situation.results.bindings
        setDataList(filterMultiple(dataBindings.map((binding: any) => sliceURI(binding.data.value))))
        setServiceList(filterMultiple(serviceBindings.map((binding: any) => sliceURI(binding.service.value))))
        setSituationList(situationBindings.map((binding: any) => sliceURI(binding.situation.value)))

        // Calculate data dependencies
        let dependencies: any = {}
        serviceBindings.forEach((binding: any) => {
          const key = sliceURI(binding.service.value)
          if (dependencies[key] === undefined) dependencies[key] = []
          // console.log("Key: " + key + " - Value: " + sliceURI(binding.dataDependency.value))
          dependencies[key].push(sliceURI(binding.vehicleData.value))
        })
        setDependencies(dependencies)
        console.log("Data dependencies:")
        console.log(dependencies)
      })
  }, [])

  return (
    <React.Fragment>
      <Typography component="h3" variant="h5" color="text.secondary">
        Select your Entities to be protected
      </Typography>
      <Box component="form" noValidate sx={{ mt: 4, width: 1 }}>
        <Grid container spacing={2}>
          <Grid item sm={6} xs={12}>
            <FormControl fullWidth>
              <Autocomplete
                options={serviceList}
                getOptionLabel={(option: string) => friendlyName(option)}
                value={entities.service}
                onChange={(_, value) => handleService(value)}
                // getOptionDisabled={(option: string) => disableOptions(option)}
                renderInput={(params) =>
                  <TextField
                    {...params}
                    label="Service"
                    error={!initialForm && entities.service === null}
                    helperText={!initialForm && entities.service === null ? "Required field" : ""} />
                } />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <FormControl fullWidth>
              <Autocomplete
                options={situationList}
                getOptionLabel={(option: string) => friendlyName(option)}
                value={entities.situation}
                onChange={(_, value) => handleSituation(value)}
                // getOptionDisabled={(option: string) => disableOptions(option)}
                renderInput={(params) => <TextField {...params} label="Situation (optional)" />} />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Autocomplete
                multiple
                options={dataList}
                getOptionLabel={(option: string) => friendlyName(option, "VD")}
                value={entities.data}
                onChange={(_, values) => handleData(values)}
                getOptionDisabled={(option: string) => disableOptions(option)}
                renderInput={(params) => <TextField
                  {...params}
                  label="Data (multiple)"
                  error={!initialForm && entities.data.length === 0}
                  helperText={!initialForm && entities.data.length === 0 ? "Required field" : ""} />
                } />
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  )
}