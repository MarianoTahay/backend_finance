const express = require('express');
const cors = require("cors");

const app = express()
app.use(express.json());
app.use(cors())

require("./app/categorias")(app)
require("./app/usuarios")(app)
require("./app/facturas")(app)
require("./app/empresas")(app)
require("./app/assets")(app)

const port = 3000

app.listen(port, () => console.log(`Escuchando en servidor puerto: ${port}`));