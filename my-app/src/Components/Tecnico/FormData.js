import './tecnico.css'

function FormData(){
    return(
        <>
            <h1>Formulario de Datos</h1>
            <form>
                <div className='ContainerForm'>
                    <div className="Container1">
                        <div className="inputContainer">
                            <label>Nombres Completos</label><br/>
                            <input className="inputContainer" type="text" /><br/><br/>
                        </div>
                        <div className="inputContainer">
                            <label>Apellidos Completos</label><br/>
                            <input className="inputContainer" type="text" /><br/><br/>
                        </div>
                        <div className="inputContainer">
                            <label>Tipo De Documento</label><br/>
                            <select className="inputContainer">
                                <option>-Selecciona una opcion-</option>
                                <option>Cedula De Ciudadania</option>
                                <option>Cedula Extrangera</option>
                                <option>Pasaporte</option>
                            </select><br/><br/>
                        </div>
                        <div className="inputContainer">
                            <label>Número De Documento</label><br/>
                            <input className="inputContainer" type="number" /><br/><br/>
                        </div>
                        <div className="inputContainer">
                            <label>Dirección</label><br/> 
                            <input className="inputContainer" type="text" /><br/><br/>
                        </div>
                    </div>

                    <div className="Container2">
                        <div className="inputContainer">
                            <label>Barrio</label><br/>
                            <input className="inputContainer" type="text" /><br/><br/>
                        </div>
                        <div className="inputContainer">
                            <label>Correo</label><br/>
                            <input className="inputContainer" type="email" /><br/><br/>
                        </div>
                        <div className="inputContainer">
                            <label>Numero De Contacto</label><br/>
                            <input className="inputContainer" type="number" /><br/><br/>
                        </div>
                        <div className="inputContainer">
                            <label>Extracto</label><br/>
                            <input className="inputContainer" type="text" /><br/><br/>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default FormData;