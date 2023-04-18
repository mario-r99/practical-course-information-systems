import { sliceURI } from "./sliceURI"

/**
* Function to get an array of related data out of the initial POST request
* @param json The raw json response data
* @returns Array of related data
*/
export function processRelatedData(responseData: any) {
  let dataDependencyJson: any = {};
  //Array with all Data from the Datadependency
  let arrayWithOnlyData: any = [];
  //Array of already picked Data (so that we dont have to show them in additional or already mark them as "picked")
  let alreadyPickedData: any = []
  //Iterate thorugh data (see exampleDataDependency.json how the response looks like)
  for (const requestedData of responseData) {
    console.log(requestedData)
    const key: any = Object.entries(requestedData)[0];
    alreadyPickedData.push(key[0])
    //key[0]=picked data (e.g. "VDIncomingAudio"), and for example key[1]= {CallsDD (<--DataDependency): Rest of Data}
    console.log(key)
    console.log(key[1].results.bindings[0]["dataDependency"]["value"])
    const dataDependencyKey = sliceURI(key[1].results.bindings[0]["dataDependency"]["value"])
    console.log(dataDependencyJson[key[0]])
    //Only iterate thorugh the next element, if the dataDependecy is not the same (If it is, the data would be the same and therefore the iteration would be pointless)
    if (dataDependencyJson[dataDependencyKey] === undefined) {
      const tempData = []
      for (const i in key[1].results.bindings) {
        let resultData = sliceURI(key[1].results.bindings[i]["restData"]["value"])
        console.log(resultData)
        tempData.push(resultData)
        if (!arrayWithOnlyData.includes(resultData)) {
          arrayWithOnlyData.push(resultData)
        }
      }
      dataDependencyJson[dataDependencyKey] = tempData
      console.log(dataDependencyJson)
    }
  }
  console.log(arrayWithOnlyData)
  console.log(dataDependencyJson)
  return arrayWithOnlyData
}
