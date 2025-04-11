export function calculateConfidenceScores(jsonOutput, logprobs, schema = null)
{
    const {scores} = loopData(jsonOutput, logprobs);
    return scores;
}

function loopData(jsonOutput, logprobs, position=0) 
{
    var scores = {};
    for(let key in jsonOutput)
    {
        let value = jsonOutput[key];
        if(value==null || typeof value === 'string')
        {
            const {score, pos} = getScore(logprobs, key, value, position);
            scores[key] = {value, score};
            position = pos;
        }
        else if(Array.isArray(value))
        {
            const objectArray = value.filter(v=>typeof v=='object');
            if(objectArray.length>0 && objectArray.length==value.length)
            {
                const arrayScores = value.map(v=>loopData(v, logprobs, position));
                const totalScore = arrayScores.reduce((a,b)=>a+b, 0);
                scores[key] = {value, score:(totalScore/arrayScores.length)};
                position = objectArray.at(-1)?.position||position;
            }
            else
            {
                const {score, pos} = getScore(logprobs, key, value, position);
                scores[key] = {value, score};
                position = pos;
            }
        }
        else if(typeof value === 'object')
        {
            const {scores:nestedScores, pos} = loopData(value, logprobs, position);
            var avgScore = Object.values(nestedScores).reduce((a,b)=>a+b.score, 0)/Object.values(nestedScores).length;
            scores[key] = {value:nestedScores, score:avgScore};
            position = pos;
        }
        else
        {
            const {score, pos} = getScore(logprobs, key, value, position);
            scores[key] = {value, score};
            position = pos;
        }
    }
    return {scores, pos:position};
}

function getScore(logprobs, key, value, position)
{
    var logproblist = [];
    var init = position;
    var spaced = `${key}": ${value}`;
    if(value == null)
        spaced = `${key}": null`;
    else if(typeof value === 'string')
        spaced = `${key}": ${JSON.stringify(value).slice(0, -1)}`;
    else if(Array.isArray(value))
        spaced = `${key}": ${JSON.stringify(value)}`;
    var unspaced = `${key}":${value}`;
    if(value == null)
        unspaced = `${key}":null`;
    else if(typeof value === 'string')
        unspaced = `${key}":${JSON.stringify(value).slice(0, -1)}`;
    else if(Array.isArray(value))
        unspaced = `${key}":${JSON.stringify(value)}`;
    while(init < logprobs.length)
    {
        var logprob = logprobs[init];
        logproblist.push(logprob);
        var part = logproblist.map(l=>l.token).join('');
        if(part.includes(spaced) || part.includes(unspaced))
        {
            var search = `${value}`;
            if(value && Array.isArray(value))
                search = JSON.stringify(value);
            let score = getValueScore(logproblist, key, search);
            return {score, pos:init};
        }
        init++;
    }
    var whole = logprobs.map(l=>l.token).join('');
    console.log('No match for', key, value, 'in', whole);
    return {score:0, pos:position};
}

function getValueScore(logprobs, key, search)
{
    var logproblist = logprobs.filter(l=>search.includes(l.token));
    if(logproblist.length==0) return 0;
    const scoreSum = logproblist.map(l=>l.logprob).reduce((a,b)=>a+b, 0);
    let score = Math.exp(scoreSum/logproblist.length);
    return score;
}
