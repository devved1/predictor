const url="https://codeforces.com/api/"



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
        async function getdata(url){
            const user=`user.rating?handle=${handlevalue}`

            const response= await fetch(url+user)
            data= await response.json()
            console.log(data)

            if(data.result.length<10){
               err_message("you have not given enough contest")
               return;
            }
            nextquery(data.result)
        }
        getdata(url)
       
        function nextquery(data){
            // plot graphs for 2 data objects rating vs time
            
            var datas=[]
            let initialtime=data[0].ratingUpdateTimeSeconds

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

    


        
        
    })


    function err_message(message){
        var p=document.getElementById("error")
        p.innerHTML=message
        p.style.color="red"
    }
}