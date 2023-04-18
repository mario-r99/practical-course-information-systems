import React from "react"
import { friendlyName } from "../utils/friendlyName"
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Typography
} from "@mui/material"

export default function RelatedDataPage({ relatedData, checkedRelatedData, handleCheckedRelatedData }: any) {

  // Set checked items list
  const handleToggle = (value: string) => {
    const currentIndex = checkedRelatedData.indexOf(value)
    const newChecked = [...checkedRelatedData]
    if (currentIndex === -1) {
      newChecked.push(value)
    } else {
      newChecked.splice(currentIndex, 1)
    }
    handleCheckedRelatedData(newChecked)
  }

  return (
    <React.Fragment>
      <Typography component="h3" variant="h5" color="text.secondary">
        Based on your input, this data should also be protected
      </Typography>
      <Box component="form" noValidate sx={{ mt: 4, width: 1 }}>
        {relatedData.length > 0
          ? (<Paper elevation={0} sx={{ mt: 4, width: 1 }}>
            <List>
              {relatedData.map((item: string) => (
                <ListItem
                  key={item}
                  disablePadding
                >
                  <ListItemButton role={undefined} onClick={() => handleToggle(item)} dense>
                    <ListItemText primary={friendlyName(item, "VD")} />
                    <ListItemIcon>
                      <Checkbox checked={checkedRelatedData.indexOf(item) !== -1} />
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>)
          : (<Typography component="h4" variant="h6" sx={{ mt: 2 }}>
            No related data found
          </Typography>)
        }
      </Box>
    </React.Fragment>
  )
}