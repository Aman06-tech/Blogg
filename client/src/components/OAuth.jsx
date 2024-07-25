import { Button } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import{ GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from "../firebase.js";
import { signInSuccess } from "../redux/user/userSlice.js";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";


export default function OAuth() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = getAuth(app);
    const handleGoogleClick = async ()=>{
         const provider = new GoogleAuthProvider()
         provider.setCustomParameters({prompt:'select_account'})
         try {
            const resultsFromGoogle = await signInWithPopup(auth, provider)
            const res = await fetch('/api/auth/google',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    email:resultsFromGoogle.user.email,
                    name:resultsFromGoogle.user.displayName,
                    image:resultsFromGoogle.user.photoURL,
            }),
        })
        const data= await res.json()
        if (res.ok){
            dispatch(signInSuccess(data))
            navigate('/')
        }
         } catch (error) {
            console.log(error);
         }
    }
  return (
    <Button type="button" gradientDuoTone="pinkToOrange" outline onClick={handleGoogleClick}>
        <AiFillGoogleCircle  className="w-6 h-6 mr-2" />
        Continue with Google
    </Button>
  );
}
