const url="https://codeforces.com/api/"
var datas=[] 
let initialtime
var ratings=[]


window.onload=function(){
    var button=document.getElementById("submit")
    button.addEventListener("click",function(e){
        e.preventDefault()
       
        
        var handle=document.getElementById("input")
        var handlevalue=handle.value.trim()


        if(!handlevalue){
          err_message("enter username")
          return;
        }

        handle.value=''
        var store=[];
        // fetching api for data
        async function getratingdata(url){
            const user=`user.rating?handle=${handlevalue}`

            const response= await fetch(url+user)
           const data= await response.json()
            console.log(data)

            if(data.result.length<10){
               err_message("aleast give 10 contests")
               return;
            }
            nextquery(data.result)
        }
        getratingdata(url)
       
        function nextquery(data){
            // plot graphs for 2 data objects rating vs time
            
    
            initialtime=data[0].ratingUpdateTimeSeconds

            for(var it=0;it<data.length;it++){
              datas.push({x:data[it].ratingUpdateTimeSeconds-initialtime,y:data[it].newRating})
            }
            console.log(datas)
            var chartid1=document.getElementById("myChart1").getContext("2d")


            new Chart(chartid1,{
                type:"scatter",
                data:{
                    datasets: [{
                        pointRadius: 4,
                        pointBackgroundColor: "rgb(0,0,255)",
                        data: datas
                      }]
                }
            })

        }
        // fetching data of users problems submit
        async function getproblemdata(url){
            const user=`user.status?handle=${handlevalue}`
            const res=await fetch(url+user)
            const data=await res.json()
            console.log(data)

            if(data.result.length<50){
                err_message("atleast submit 50 problems")
                return;
            }

            callforproblemset(data.result)
            
           }
           getproblemdata(url)

           function callforproblemset(data){
                let filterdata=[]
                for(var i=0;i<data.length;i++){
                    if(data[i].verdict=="OK"){
                        filterdata=[...filterdata,data[i]]
                    }
                }
                console.log(filterdata)
                let prevtime=0
                for(var i=0;i<datas.length;i++){
                    let currtime=datas[i].x+initialtime
                    ratings[i]=[]
                    for(var j=0;j<filterdata.length;j++){
                       if(filterdata[j].creationTimeSeconds<=currtime && filterdata[j].creationTimeSeconds>prevtime){
                           ratings[i].push({"rating":filterdata[j].problem.rating,"type":filterdata[j].author.participantType})
                       }                       
                    }
                    prevtime=currtime
                }
                console.log(ratings)
                
           }
           
    


        
        
    })


    function err_message(message){
        var p=document.getElementById("error")
        p.innerHTML=message
        p.style.color="red"
    }
}