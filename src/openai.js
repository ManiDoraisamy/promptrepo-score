export function calculateConfidenceScores(jsonOutput, logprobs, schema = null)
{
    return loopData(jsonOutput, logprobs);
}

function loopData(jsonOutput, logprobs, position=0) 
{
    var scores = {};
    for(let key in jsonOutput)
    {
        let value = jsonOutput[key];
        let search = '';
        if(value === null || value === undefined)
            search = `null`;
        else if(typeof value === 'string')
            search = `"${value}"`;
        else if(Array.isArray(value))
        {
            search = JSON.stringify(value);
            value = value.map(v=>{
                if(v === null || v === undefined || Array.isArray(v))
                    return v;
                else if(typeof v === 'object')
                    return loopData(v, logprobs, position);
                else
                    return v;
            });
        }
        else if(typeof value === 'object')
        {
            search = JSON.stringify(value);
            value = loopData(value, logprobs, position);
        }
        else
            search = value;
        const {score, pos} = getScore(logprobs, key, search, position);
        scores[key] = {value, score};
        position = pos;
    }
    return scores;
}

function getScore(logprobs, key, search, position)
{
    var logproblist = [];
    var init = position;
    while(init < logprobs.length)
    {
        var logprob = logprobs[init];
        logproblist.push(logprob);
        var part = logproblist.map(l=>l.token).join('');
        if(part.includes(`"${key}":${search}`) || part.includes(`"${key}": ${search}`))
        {
            const scoreSum = logproblist.map(l=>l.logprob).reduce((a,b)=>a+b, 0);
            let score = Math.exp(scoreSum/logproblist.length);
            return {score, pos:init};
        }
        init++;
    }
    var whole = logprobs.map(l=>l.token).join('');
    console.log('score not found', search, 'in', whole);
    return {score:0, pos:position};
}
