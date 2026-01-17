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
                    googlePhotoUrl:resultsFromGoogle.user.photoURL,
            }),
        })
        const data= await res.json()
        if (res.ok){
            dispatch(signInSuccess(data.user))
            navigate('/')
        }
         } catch (error) {
            console.log(error);
         }
    }
  return (
    <Button
      type="button"
      color="gray"
      className="w-full border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
      onClick={handleGoogleClick}
    >
        <AiFillGoogleCircle className="w-5 h-5 mr-2" />
        Continue with Google
    </Button>
  );
}
