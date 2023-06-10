const url="https://codeforces.com/api/"
let initialtime
var datas=[]
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

           async function callforproblemset(data){
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
                     if(typeof arr[j].rating=='undefined'){
                        
                        sum+=datas[datas.length-1].y
                     }
                     else{
                     sum+=arr[j].rating
                     }
                   }
                   if((arr.length)){
                   sum/=(arr.length)
                   }
                   graph.push(Math.floor(sum))
                }
                console.log(graph)
                console.log(ratingchange)

                var dataid=[]
                for(var i=0;i<graph.length;i++){
                    dataid.push({x:graph[i],y:ratingchange[i]})
                }

                var chartid1=document.getElementById("myChart1").getContext("2d")

                new Chart(chartid1,{
                    type:"scatter",
                    data:{
                        datasets: [{
                            pointRadius: 4,
                            pointBackgroundColor: "rgb(0,0,255)",
                            data: dataid
                          }]
                    }
                })
                document.getElementById("graphstatement").innerHTML="rating change with average rating problem solve in given time period"
                
                
                const model=createModel()
                tfvis.show.modelSummary({name:'ModelSummary'},model)
                const TensorData=convertTensor(dataid)
                const {inputs,labels,inputMin}=TensorData
                console.log(inputMin)
                 
                console.log(inputs,labels,model)
                // train the data
                 await trainmodel(model,inputs,labels)
                console.log('done training')
                
                
           }

           
                // start regression technique
                function createModel(){
                    // create a sequential model
                    const model= tf.sequential()

                    //add single input layer
                    model.add(tf.layers.dense({inputShape:[1],units:1,useBias:true}))

                    // add output layer
                    model.add(tf.layers.dense({units:1,useBias:true}))

                    return model

                }
               // convert model to tensor and do shuffling and normalization
                function convertTensor(data){
                  

                    return tf.tidy(()=>{
                       // shuffle the data
                       tf.util.shuffle(data)
                       
                       // convert data to tensor
                       const inputs=data.map(d => d.x)
                       const labels=data.map(d => d.y)

                       const inputTensor= tf.tensor2d(inputs,[inputs.length,1])
                       const labelTensor= tf.tensor2d(labels,[labels.length,1])

                       // normalize data to 0-1 using min-max normalization
                       const inputMax= inputTensor.max()
                       const inputMin =inputTensor.min()
                       const labelMax= labelTensor.max()
                       const labelMin=labelTensor.min()

                       const normalizedInput=inputTensor.sub(inputMin).div(inputMax.sub(inputMin))
                       const normalizedlabel=inputTensor.sub(labelMin).div(labelMax.sub(labelMin))

                       return {
                         inputs:normalizedInput,
                         labels:normalizedlabel,
                         inputMin,
                         inputMax,
                         labelMin,
                         labelMax
                       }

                    })
                }

                async function trainmodel(model,inputs,labels){
                    // prepare the model for training
                    model.compile({
                        // algorithm used
                        optimizer: tf.train.adam(),
                        // loss model using meansquarederror
                        loss: tf.losses.meanSquaredError,
                        metrics: ['mse'],
                    })
                    const batchSize =datas.length
                    const epochs = 50

                    return await model.fit(inputs,labels,{
                        batchSize,
                        epochs,
                        shuffle:true,
                        callbacks: tfvis.show.fitCallbacks(
                            { name: 'Training Performance' },
                            ['loss', 'mse'],
                            { height: 200, callbacks: ['onEpochEnd'] }
                        )
                    })
                                    
                }
                




           
    


        
        
    })


    function err_message(message){
        var p=document.getElementById("error")
        p.innerHTML=message
        p.style.color="red"
    }
}