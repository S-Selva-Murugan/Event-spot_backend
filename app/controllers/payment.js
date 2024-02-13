const button = document.querySelector("button")
button.addEventListener("click",()=>{
    bookingId = "65a35203312d7944abac64f8"
    fetch(`/api/booking/${bookingId}/payment`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            ticketData:[
                {
                 _id:"65a186661351d7e0b9fc73b2",  
                 quantity:2   
               } 
           ]
        })
    }).then(res=>{
        if(res.ok) return res.json()
        return res.json().then(json=>Promise.reject(json))
    }).then(({url})=>{
window.location = url})
})