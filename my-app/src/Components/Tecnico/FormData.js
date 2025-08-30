import './tecnico.css'

function FormData(){
    return(
       <>
            <h1 className="titulo-form">Formulario de Datos</h1>
            <form >
              <div className="ContainerForm">
                <div className="Container1">
                  <div className="inputContainer">
                    <label>Nombres Completos</label>
                    <input type="text" name="nombres"/>
                  </div>
                  <div className="inputContainer">
                    <label>Apellidos Completos</label>
                    <input type="text" name="apellidos"  />
                  </div>
                  <div className="inputContainer">
                    <label>Tipo de Documento</label>
                    <select name="tipoDocumento" >
                      <option>- Selecciona una opción -</option>
                      <option>Cédula de Ciudadanía</option>
                      <option>Cédula Extranjera</option>
                      <option>Pasaporte</option>
                    </select>
                  </div>
                </div>

                <div className="Container2">
                  <div className="inputContainer">
                    <label>Número de Documento</label>
                    <input type="number" name="documento" />
                  </div>
                  <div className="inputContainer">
                    <label>Dirección</label>
                    <input type="text" name="direccion"  />
                  </div>
                  <div className="inputContainer">
                    <label>Correo</label>
                    <input type="email" name="correo" />
                  </div>
                </div>
              </div>
              <button type="submit">ENVIAR</button>
            </form>
        </>

    )
}

export default FormData;