/**
* Function to slice the URI correctly without namespace
* @param uri An Uri from an instance
* @returns Sliced Uri without namespace
*/
export function sliceURI(uri: string) {
  try {
    var splitArray = uri.split("#");
    if (splitArray.length === 1) {
      splitArray = uri.split("/"); // some namespaces are maybe splitted with "#" instead of "/"
      if (splitArray.length === 1) {
        splitArray = uri.split(":"); // some namespaces are maybe splitted with ":" instead of "/"
      }
    }
    return splitArray[splitArray.length - 1];
  } catch (error) {
    console.log("URI " + uri + "doesn't have a / or is empty");
    return uri
  }
}
