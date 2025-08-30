export default function Redirecting(){
    const Redirect = () => {
        location.href = "/wiki/13ninstudio";
    }
    return(
        <button onClick={Redirect}><span>リダイレクト</span></button>
    )
}