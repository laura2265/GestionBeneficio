import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    
    const navigate = useNavigate();

    const [formDataLogin, setFormDataLogin]= useState({
        emailL: '',
        passwordL: ''
    })

    const [ formErrorsLogin, setFormErrorsLogin ] = useState({});
    const [ isSubmitLogin, setIsSubmitLogin] = useState(false);

    const handleInputChangeLogin = (e)=>{
        const { name, value } = e.target;
        setFormDataLogin({...formDataLogin, [name]: value})
    }

    const validateFormLogin = async () => {
        let UserRol = '';
        let UserId = ''
        let erros={}

        if(!formDataLogin.emailL){
            erros.emailL = "El email es obligatorio"
        }

        if(! formDataLogin.passwordL){
            erros.passwordL = "La contraseña es obligatoria"
        }

        try{
            const response = await fetch(`http://localhost:3000/api/users/`,{
                method: 'GET'
            })

            if(!response.ok){
                throw new Error(`Error al traer los datos de la base de datos`)
            }

            const result = await response.json();
            const data = result.items
            console.log('Los datos de la base de datos son: ', data);

            let isValid = false;
            for(const item of data){
                console.log(`datos: ${item.email}, contraseña: ${item}`)
            }

        }catch(error){
            console.error('Error al consultar los datos de la base de datos: ', error);
        }
    }

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