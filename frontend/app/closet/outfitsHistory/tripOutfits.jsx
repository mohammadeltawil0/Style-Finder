import { useLocalSearchParams } from "expo-router"; // use to get id of outfit card click to get data from DB // need to rework there is mistake 


export default function tripOutfits() {
    console.log("Tripoutfit")

    // TODO: Fetch data of the TRIP my the id/name whatever we decide
    // TODO: API call here something like this: just the blue print not sure how backend look like now 
    // const [TRIP, setTRIP] = useState(null);
    // useEffect(() => {
    //   const fetchTRIP = async () => {
    //     setTRIP(data);
    //   };
    //   fetchTRIP();
    // }, [id]); 

    // For now console 
    const { id } = useLocalSearchParams();

    // Duplicate Dummy Data
    const trips = [
        { id: "t1", trip_location: "NYC", dates: "03/01/26 - 03/05/26", outfits: [{}, {}, {}, {}, {}, {}], },
        { id: "t2", trip_location: "Beach Trip", dates: "04/10/26 - 04/15/26", outfits: [{}, {}, {}, {}, {}, {}], },
        { id: "t3", trip_location: "NYC Trip", dates: "03/01/26 - 03/05/26" , outfits: [{}, {}, {}, {}, {}, {}],},
        { id: "t4", trip_location: "Beach Trip", dates: "04/10/26 - 04/15/26", outfits: [{}, {}, {}, {}, {}, {}], },
    ];
    const tripsDetails = trips.find(t => t.id === id);
    console.log("Clicked Outfit:", tripsDetails);
    
}
