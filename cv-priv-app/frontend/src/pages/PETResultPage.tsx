import React from "react"
import { friendlyName } from "../utils/friendlyName"
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

export default function PETResultPage({ PETResults }: any) {

  // Set sorting toggle options
  const firstSorting = "serviceQuality"
  const secondSorting = "privacyProperty"
  const [sorting, setSorting] = React.useState(firstSorting);

  // Handle Sorting toggle button change
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    if (newAlignment !== null) setSorting(newAlignment)
  }

  // Reverse PET result list if sorting is option 2
  const applySorting = (list: any) => {
    if (sorting === firstSorting) {
      return list
    }
    else {
      return [...list].reverse()
    }
  }

  return (
    <React.Fragment>
      <Typography component="h3" variant="h5" color="text.secondary">
        Select these Privacy Enhanced Technologies (PETs)
      </Typography>
      <Box component="form" noValidate sx={{ mt: 4, width: 1 }}>
        <ToggleButtonGroup
          sx={{ width: 1 }}
          color="primary"
          value={sorting}
          exclusive
          onChange={handleChange}
          aria-label="Sorting"
        >
          <ToggleButton sx={{ width: "50%" }} value={firstSorting}>Sort by Service Quality</ToggleButton>
          <ToggleButton sx={{ width: "50%" }} value={secondSorting}>Sort by Privacy Property</ToggleButton>
        </ToggleButtonGroup>
        {PETResults.length > 0
          ? (<Paper elevation={0} sx={{ mt: 4, width: 1 }}>
            {applySorting(PETResults).map((option: any, index: number) => (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ width: '50%', flexShrink: 0 }}>{index + 1}. PET Combination</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{option.length} PETs</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name of PET</TableCell>
                          <TableCell align="right">Protected Data Type</TableCell>
                          <TableCell align="right">SLA Attribute</TableCell>
                          <TableCell align="right">SLA Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {option.map((pet: any) => (
                          <TableRow
                            key={pet.name}
                          >
                            <TableCell component="th" scope="row">
                              {friendlyName(pet.name, "PET_")}
                            </TableCell>
                            <TableCell align="right">{friendlyName(pet.dataType, "VD")}</TableCell>
                            <TableCell align="right">{friendlyName(pet.slaAttribute)}</TableCell>
                            <TableCell align="right">{pet.slaValue}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>)
          : (<Typography component="h4" variant="h6" sx={{ mt: 2 }}>
            No PETs found
          </Typography>)
        }
      </Box>
    </React.Fragment>
  )
}