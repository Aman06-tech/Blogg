import { useSelector } from "react-redux"

export default function DashProfile() {
    const {CurrentUser} = useSelector((state) => state.user)
  return (
    <div>
        <h1>Profile</h1>   
       <form>
        <img src={CurrentUser.profilePicture} />
       </form>
    </div>
  )
}
