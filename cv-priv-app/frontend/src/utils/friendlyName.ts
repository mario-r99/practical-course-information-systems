/**
* Function to get a nice to look string out of a PascalCase string
* @param string The string to be processed
* @param string An optional string to cut out
* @returns Sliced Uri without namespace
*/
export function friendlyName(name: string, uselessString: string = "") {
  return name
    .replace(uselessString, "")
    .replaceAll("_", " ") // Replace underscores with spaces
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // Add space between PascalCase
}
