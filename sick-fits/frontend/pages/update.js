import UpdateItem from '../components/UpdateItem';

const Create = ({query}) => (
  <div>
    <UpdateItem id={query.id}/>
  </div>
);

export default Create;