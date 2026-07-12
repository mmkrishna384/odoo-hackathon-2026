function PageHeader({ title, buttonText, onClick }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>

      <button
        onClick={onClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
      >
        {buttonText}
      </button>
    </div>
  );
}

export default PageHeader;