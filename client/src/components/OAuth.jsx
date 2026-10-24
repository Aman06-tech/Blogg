import { Button } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import{ GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from "../firebase.js";
import { signInSuccess } from "../redux/user/userSlice.js";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


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
        } else {
            toast.error(data.message || 'Sign-in failed on the server.')
        }
         } catch (error) {
            // Previously this only console.log'd, so any failure left the
            // button looking dead. Surface the real reason instead.
            console.error('Google sign-in failed:', error)
            const code = error?.code || ''
            const messages = {
                'auth/unauthorized-domain': 'This domain is not authorised in Firebase. Add it under Authentication > Settings > Authorized domains.',
                'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups for this site and try again.',
                'auth/popup-closed-by-user': 'Sign-in was cancelled.',
                'auth/cancelled-popup-request': 'Sign-in was cancelled.',
                'auth/network-request-failed': 'Network error reaching Google. Check your connection and try again.',
                'auth/operation-not-allowed': 'Google sign-in is not enabled for this Firebase project.',
            }
            toast.error(messages[code] || `Google sign-in failed${code ? ` (${code})` : ''}. See console for details.`)
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
