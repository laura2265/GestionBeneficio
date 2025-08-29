function Login() {
    return(
        <>
            <div className="FormLogin">
                <h1>Iniciar Sesion </h1>
                <form>
                    <div className="inputContainer">
                        <input className="inputContainerInput" type="text" /><br/><br/>
                        <label className="inputContainerLabel">Usuario</label><br/>
                    </div>
                    <div className="inputContainer">
                        <input type="password" className="inputContainerInput" /><br/><br/>
                        <label className="inputContainerLabel">Contraseña</label><br/>
                    </div>
                    <button type="submit" className="InputButton1">Ingresar</button>
                </form>
            </div>
        </> 
    )
}
export default Login 