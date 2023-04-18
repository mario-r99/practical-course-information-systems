# Privacy Context Model for Connected Vehicle Environments

## CV-Priv App
A web application to dynamically create Privacy Policies depending on data the user wants to protect

### Installation
If you just want to run the app, follow the the Deployment instructions.
For developing the application, you need to follow the Development instructions.

#### Just Deployment
1. Install Docker with [these](#install-docker) instructions.
2. Follow [these](#clone-the-repository) instructions to clone and run the app.

#### Active Development
There are two ways for developing the application locally. You can either install the required Development toolchain by yourself on your host machine, or use a Docker Development Environment. Use the second method, if you don't want to install the whole toolchain to your computer.

##### Method 1: Local installation
First, install Docker with [these](#install-docker) instructions
Then install these tools on your local machine:
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)
- [Python](https://www.python.org/)
- [Poetry](https://python-poetry.org/)

Then, clone the repository, as instructed [here](#clone-the-repository)
Finally, follow [this](#install-dependencies) instructions to install the local dependencies

##### Method 2: Docker Development Environment
You need to have Docker installed, follow [these](#install-docker) instructions.
Then, make sure you have installed [Visual Studio Code](https://code.visualstudio.com/)
and the [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) for VS Code.

1. Open VS Code
2. Go to the Remote Explorer in the left sidebar
3. In the "Devvolumes" section, click on the icon "Clone Repository in Container Volume..."
4. Enter `https://gitlab-as.informatik.uni-stuttgart.de/liyunxuan/cv-priv.git`
5. Wait until the Development Container is set up completely (This can take some minutes)
6. Open the console and type `cd cv-priv-app`
7. Type `docker compose up`
8. View the app at `localhost:3000` in your browser

#### Install Docker
You need to have [Docker](https://www.docker.com/) installed on your computer to run the application.
> On Windows you need to install [WSL through the Microsoft Store](https://apps.microsoft.com/store/detail/windows-subsystem-for-linux/9P9TQF7MRM4R) first, to get the newest version!

Then, go back to your instructions.

#### Clone the Repository
1. Open a terminal
2. Clone this repository into an empty folder:<br>
`git clone https://gitlab-as.informatik.uni-stuttgart.de/liyunxuan/cv-priv.git
`
3. Navigate to the app:<br>
`cd cv-priv\cv-priv-app`
4. Build and run the docker containers:<br>
`docker compose up`
5. View the app at `localhost:3000` in your browser

Go back to your instructions

#### Install Dependencies
1. Navigate to frontend:<br>
`cd frontend`
2. Remove the initial node modules folder:<br>
`sudo rm -rf node_modules/`
3. Install the frontend dependencies:<br>
`yarn install`
4. Navigate to backend:<br>
`cd ../backend`
5. Install the backend dependencies:<br>
`poetry install`

Go back to your instructions

### Usage
#### Update Code
To update the code, just save your changes and refresh the page in your browser.

#### Install new packages
To install new packages and run the app again, you need to rebuild the docker containers. To do that, run the following commands in the terminal:
1. `docker compose down` or hit `Ctrl+C` in the terminal
2. `docker system prune -a`
3. `docker compose up`
The changes should be visible in your browser after the containers are up and running.

#### Ontology placement
To get the app working, you have to put the wanted ontology as a ttl file in this directory:
`<root>/cv-priv-app/backend/src/offline_lib/ttl_files`.
You can also switch to different file formats, but if you do so, you need to edit `offline_app.py` in:
`<root>/cv-priv-app/backend/src/offline_lib/offline_app.py`.

See [here](https://rdflib.readthedocs.io/en/stable/intro_to_parsing.html#:~:text=within%20serialize()%3A-,RDF%20Format,-Keyword "RDFlib Homepage") to get the information which formats RDFlib can work with.


### Toolchain
These tools and technologies were used to create the app:
- Backend
  - Python
  - Poetry
- Frontend
  - Node.js
  - yarn
- Orchestration
  - Docker Compose

## Authors
- Ann-Kathrin Kapfenstein
- Denis Moslavac
- Mario Ruoff
