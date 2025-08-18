import { getRooms } from "@/actions/roomAction";
import { Rooms } from "@/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { GiSolarSystem } from "react-icons/gi";

const MeetDrawView = () => {
  const [rooms, setRooms] = useState<Rooms[]>([]);

  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    const fetchRooms = async () => {
      const data = await getRooms({ search });
      setRooms(data?.rooms);
    };
    fetchRooms();
  }, [search]);

  if (!rooms) {
    return null;
  }

  return (
    <>
      <div className="flex w-full  items-center">
        <SearchBar search={search} />
      </div>
      {rooms.length === 0 && (
        <div className="flex justify-center gap-2 text-neutral-400  ">
          <p>No rooms found</p>
          <GiSolarSystem className="text-2xl rotate-y-180 " />
          <GiSolarSystem className="text-2xl " />
        </div>
      )}
    </>
  );
};

export default MeetDrawView;
