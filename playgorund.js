
const ticketdata = ticketType= [
    {
        ticketName: " Platinum",
        ticketPrice: 1000,
        ticketCount: 1000,
        remainingTickets: 1000,
        _id: "65d3f940b67523ec1c8b9a5d"
    },
    {
        ticketName: "Gold",
        ticketPrice: 800,
        ticketCount: 1000,
        remainingTickets: 1000,
        _id: "65d3f940b67523ec1c8b9a5e"
    }
]

function findCheapestTicketClass(ticketArray){
    const totalCost = ticketArray.reduce((acc,cv)=>{
        acc+=cv.ticketPrice
        return acc
    },0)

    let result = null 

    const dataToMap = ticketArray.forEach((ticket)=>{
        if(!result || ticket.ticketPrice < totalCost){
            result = ticket.ticketPrice
        }
    })

    return result
}

console.log(findCheapestTicketClass(ticketdata))