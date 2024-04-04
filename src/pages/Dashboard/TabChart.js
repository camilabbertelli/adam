import "./../../styles/TabChart.css"

let currentPerspective = "Overview"

const TabChart = () => {
    const changePerspective = (perspective) => {

        var entryOverview = document.getElementById("tabOverview");
        var entryPanning = document.getElementById("tabPanning");
        var entryBla = document.getElementById("tabBla");

        if (!entryOverview || !entryPanning || !entryBla)
            return

        if (perspective == "Overview"){
            entryOverview.setAttribute('class', 'active')
            entryPanning.setAttribute('class', '')
            entryBla.setAttribute('class', '')
        } else if (perspective == "Panning"){
            entryOverview.setAttribute('class', '')
            entryPanning.setAttribute('class', 'active')
            entryBla.setAttribute('class', '')
        } else if (perspective == "Bla"){
            entryOverview.setAttribute('class', '')
            entryPanning.setAttribute('class', '')
            entryBla.setAttribute('class', 'active')
        } 
    
        currentPerspective = perspective
    
        //updateScatter()
    }

    return (
        <div className="tab">
            <button id="tabOverview" className="active" style={{"borderRadius": "10px 10px 0px 0px"}} onClick={() => changePerspective('Overview')}>Overview</button>
            <button id="tabPanning" style={{"borderRadius": "10px 10px 0px 0px"}} onClick={() => changePerspective('Panning')}>Panning</button>
            <button id="tabBla" style={{"borderRadius": "10px 10px 0px 0px"}} onClick={() => changePerspective('Bla')}>Bla</button>
        </div>
    )
}

export default TabChart;