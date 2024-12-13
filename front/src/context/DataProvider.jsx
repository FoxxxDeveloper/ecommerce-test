/* eslint-disable react/prop-types */
import { DataContext } from "./DataContext";

const DataProvider = ({ children }) => {

//   ""

  const URL =  "http://localhost:4002/"





  return (
    <DataContext.Provider value={{URL }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
