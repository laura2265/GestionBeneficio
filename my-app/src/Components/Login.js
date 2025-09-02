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
        let errors={}

        if(!formDataLogin.emailL){
            errors.emailL = "El email es obligatorio"
        }

        if(! formDataLogin.passwordL){
            errors.passwordL = "La contraseña es obligatoria"
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
                console.log(`datos: ${item.email}, contraseña: ${item.password}`);

                if(item.email === formDataLogin.emailL && item.password === formDataLogin.passwordL){
                    const responseRole = await fetch('http://localhost:3000/api/user-role/', {
                        method: 'GET',
                        headers: {
                            "x-user-id": item.id,
                            "Content-Type": 'application/json'
                        }
                    })
                    isValid = true;
                    UserId = item.id;
                }
            }
            if(!isValid){
                const emailExist = data.some((item) => item.email === formDataLogin.emailL)
                if(!emailExist){
                    errors.emailL = 'El CORREO es incorrecto'
                }else{
                    errors.passwordL = 'La CONTRASEÑA es incorrecta'
                }
            }

        }catch(error){
            console.error('Error al consultar los datos de la base de datos: ', error);
        }
        return { errors, UserRol, UserId};
    }

    const handleSubmitLogin = async(e)=>{
        e.preventDefault();

        const {errors, UserRol, UserId} = await validateFormLogin();
        setFormErrorsLogin(errors);
        setIsSubmitLogin(true);

        if(Object.keys(errors).length === 0){
            setIsSubmitLogin(true);
            console.log('Redirigiendo según el rol del ususario ');
            saveUserRol(UserRol);
            saveUserId(UserId);
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