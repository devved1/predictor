const url="https://codeforces.com/api/"
var datas=[] 
let initialtime
var ratings=[]
var ratingchange=[]


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
            
    
            initialtime=data[0].ratingUpdateTimeSeconds
            let prev=0
            for(var i=0;i<data.length;i++){
               ratingchange.push(data[i].newRating-prev)
               prev=data[i].newRating
            }

            for(var it=0;it<data.length;it++){
              datas.push({x:data[it].ratingUpdateTimeSeconds-initialtime,y:data[it].newRating})
            }
            console.log(datas)



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

                let graph=[]
                for(var i=0;i<ratings.length;i++){
                   let arr=[]
                   arr=ratings[i]
                   sum=0
                   for(var j=0;j<arr.length;j++){
                     sum+=arr[j].rating
                   }
                   sum/=(arr.length)
                   graph.push(Math.floor(sum))
                }
                console.log(graph)
                console.log(ratingchange)

                datas=[]
                for(var i=0;i<graph.length;i++){
                    datas.push({x:graph[i],y:ratingchange[i]})
                }

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
                document.getElementById("graphstatement").innerHTML="rating change with average rating problem solve in given time period"


                
                
           }
           
    


        
        
    })


    function err_message(message){
        var p=document.getElementById("error")
        p.innerHTML=message
        p.style.color="red"
    }
}