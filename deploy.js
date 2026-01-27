const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();
const config = {
    user: "u782511739.raco.gob.ar",
    password: "E|5bzOYVeJU&o9m1",
    host: "ftp.tucma.com",
    port: 21,
    localRoot: __dirname + "/out", // La carpeta que genera Next.js
    remoteRoot: "/public_html",
    include: ["*", "**/*"], // Sube todo
    deleteRemote: true, // Limpia el servidor antes de subir (CUIDADO)
    forcePasv: true
};

ftpDeploy.deploy(config)
    .then(res => console.log("¡Despliegue finalizado con éxito!"))
    .catch(err => console.log("Error en el despliegue: ", err));