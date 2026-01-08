import React, { useEffect, useState } from 'react'
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import './Style.css'
import { Collapse } from 'react-collapse';
import { FaAngleDown } from "react-icons/fa6";
import Button from '@mui/material/Button';
import { FaAngleUp } from "react-icons/fa6";
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import Rating from '@mui/material/Rating';

import { fetchCategories } from '../../api/catalog';

const Sidebar = ({
  selectedCategory = "",
  onChangeCategory,
  onFiltersChange,
  initialFilters = {}
}) => {
  const [isOpenCatehoryfilter, setIsOpenCatehoryfilter] = useState(true);
  const [isOpenAvailfilter, setIsOpenAvailfilter] = useState(true);
  const [isOpenSizefilter, setIsOpenSizefilter] = useState(true);
  const [isOpenPricefilter, setIsOpenPricefilter] = useState(true);
  const [isOpenRatingfilter, setIsOpenRatingfilter] = useState(true);

  const [categories, setCategories] = useState([]);

  // Filter states
  const [availability, setAvailability] = useState(initialFilters.availability || 'all');
  const [selectedSizes, setSelectedSizes] = useState(initialFilters.sizes || []);
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || [100, 5000]);
  const [rating, setRating] = useState(initialFilters.rating || 0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchCategories();
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setCategories([]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange?.({
      availability,
      sizes: selectedSizes,
      priceRange,
      rating
    });
  }, [availability, selectedSizes, priceRange, rating]);

  const categoryOptions = categories
    .filter((c) => c && c.active)
    .filter((c) => !c.parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleAvailabilityChange = (value) => {
    setAvailability(value);
  };

  const handleSizeChange = (size, checked) => {
    if (checked) {
      setSelectedSizes(prev => [...prev, size]);
    } else {
      setSelectedSizes(prev => prev.filter(s => s !== size));
    }
  };

  const handlePriceChange = (values) => {
    setPriceRange(values);
  };

  const handleRatingChange = (value) => {
    setRating(value === rating ? 0 : value); // Toggle rating
  };

  const clearAllFilters = () => {
    setAvailability('all');
    setSelectedSizes([]);
    setPriceRange([100, 5000]);
    setRating(0);
  };

  return (
    <aside className='sidebar'>
      <div className='box'>
        <h3 className='w-fullmb-3 text-[16px] font-[500] flex items-center pr-5'>Shop by Category
          <Button className="!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-[#000]" onClick={() => setIsOpenCatehoryfilter(!isOpenCatehoryfilter)}>
            {
              isOpenCatehoryfilter === true ? <FaAngleUp /> : <FaAngleDown />
            }

          </Button>
        </h3>
        <Collapse isOpened={isOpenCatehoryfilter}>
          <div className='Scroll px-4 relative -left-[13px]'>
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={!selectedCategory}
                  onChange={() => onChangeCategory?.("")}
                />
              }
              label="All"
              className='w-full'
            />

            {categoryOptions.map((c) => (
              <FormControlLabel
                key={c.id}
                control={
                  <Checkbox
                    size='small'
                    checked={selectedCategory === c.name}
                    onChange={() => {
                      const next = selectedCategory === c.name ? "" : c.name;
                      onChangeCategory?.(next);
                    }}
                  />
                }
                label={c.name}
                className='w-full'
              />
            ))}

          </div>
        </Collapse>
      </div>

      <div className='box'>
        <h3 className='w-fullmb-3 text-[16px] font-[500] flex items-center pr-5'>Availability
          <Button className="!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-[#000]" onClick={() => setIsOpenAvailfilter(!isOpenAvailfilter)}>
            {
              isOpenAvailfilter === true ? <FaAngleUp /> : <FaAngleDown />
            }

          </Button>
        </h3>
        <Collapse isOpened={isOpenAvailfilter}>
          <div className='Scroll px-4 relative -left-[13px]'>
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={availability === 'all'}
                  onChange={() => handleAvailabilityChange('all')}
                />
              }
              label="Available (17)"
              className='w-full'
            />
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={availability === 'in_stock'}
                  onChange={() => handleAvailabilityChange('in_stock')}
                />
              }
              label="In stock (10)"
              className='w-full'
            />
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={availability === 'not_available'}
                  onChange={() => handleAvailabilityChange('not_available')}
                />
              }
              label="Not Available (1)"
              className='w-full'
            />
          </div>
        </Collapse>
      </div>

      <div className='box mt-3'>
        <h3 className='w-fullmb-3 text-[16px] font-[500] flex items-center pr-5'>Size
          <Button className="!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-[#000]" onClick={() => setIsOpenSizefilter(!isOpenSizefilter)}>
            {
              isOpenSizefilter === true ? <FaAngleUp /> : <FaAngleDown />
            }

          </Button>
        </h3>
        <Collapse isOpened={isOpenSizefilter}>
          <div className='Scroll px-4 relative -left-[13px]'>
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={selectedSizes.includes('small')}
                  onChange={(e) => handleSizeChange('small', e.target.checked)}
                />
              }
              label="Small (6)"
              className='w-full'
            />
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={selectedSizes.includes('medium')}
                  onChange={(e) => handleSizeChange('medium', e.target.checked)}
                />
              }
              label="Medium (5)"
              className='w-full'
            />
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={selectedSizes.includes('large')}
                  onChange={(e) => handleSizeChange('large', e.target.checked)}
                />
              }
              label="Large (7)"
              className='w-full'
            />
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={selectedSizes.includes('xl')}
                  onChange={(e) => handleSizeChange('xl', e.target.checked)}
                />
              }
              label="XL (1)"
              className='w-full'
            />
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={selectedSizes.includes('xxl')}
                  onChange={(e) => handleSizeChange('xxl', e.target.checked)}
                />
              }
              label="XXL (3)"
              className='w-full'
            />
          </div>
        </Collapse>
      </div>

      <div className='box mt-4'>
        <h3 className='w-fullmb-3 text-[16px] font-[500] flex items-center pr-5'>Filter By Price
          <Button className="!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-[#000]" onClick={() => setIsOpenPricefilter(!isOpenPricefilter)}>
            {
              isOpenPricefilter === true ? <FaAngleUp /> : <FaAngleDown />
            }

          </Button>
        </h3>
        <Collapse isOpened={isOpenPricefilter}>
          <RangeSlider
            value={priceRange}
            onInput={handlePriceChange}
            min={0}
            max={10000}
            step={100}
          />

          <div className='flex pt-4 pb-2 pricerange'>
            <span className='text-[14px]'>
              From:<strong className='text-dark'>Rs: {priceRange[0]}</strong>
            </span>

            <span className='ml-auto text-[14px]'>
              From:<strong className='text-dark'>Rs: {priceRange[1]}</strong>
            </span>
          </div>
        </Collapse>
      </div>

      <div className='box mt-4'>
        <h3 className='w-fullmb-3 text-[16px] font-[500] flex items-center pr-5'>Filter By Rating
          <Button className="!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-[#000]" onClick={() => setIsOpenRatingfilter(!isOpenRatingfilter)}>
            {
              isOpenRatingfilter === true ? <FaAngleUp /> : <FaAngleDown />
            }

          </Button>
        </h3>
        <Collapse isOpened={isOpenRatingfilter}>
          <div className='w-full cursor-pointer' onClick={() => handleRatingChange(5)}>
            <Rating
              name="rating-5"
              value={5}
              size='small'
              readOnly
              className={rating === 5 ? 'text-yellow-500' : 'text-gray-300'}
            />
          </div>

          <div className='w-full cursor-pointer' onClick={() => handleRatingChange(4)}>
            <Rating
              name="rating-4"
              value={4}
              size='small'
              readOnly
              className={rating === 4 ? 'text-yellow-500' : 'text-gray-300'}
            />
          </div>

          <div className='w-full cursor-pointer' onClick={() => handleRatingChange(3)}>
            <Rating
              name="rating-3"
              value={3}
              size='small'
              readOnly
              className={rating === 3 ? 'text-yellow-500' : 'text-gray-300'}
            />
          </div>

          <div className='w-full cursor-pointer' onClick={() => handleRatingChange(2)}>
            <Rating
              name="rating-2"
              value={2}
              size='small'
              readOnly
              className={rating === 2 ? 'text-yellow-500' : 'text-gray-300'}
            />
          </div>

          <div className='w-full cursor-pointer' onClick={() => handleRatingChange(1)}>
            <Rating
              name="rating-1"
              value={1}
              size='small'
              readOnly
              className={rating === 1 ? 'text-yellow-500' : 'text-gray-300'}
            />
          </div>

          <div className='w-full cursor-pointer' onClick={() => handleRatingChange(0)}>
            <Rating
              name="rating-0"
              value={0}
              size='small'
              readOnly
              className={rating === 0 ? 'text-yellow-500' : 'text-gray-300'}
            />
            <span className='text-xs text-gray-600 ml-2'>Clear Rating</span>
          </div>
        </Collapse>
      </div>

      {/* Reviews Section */}
      <div className='box mt-4'>
        <h3 className='w-fullmb-3 text-[16px] font-[500] flex items-center pr-5'>Customer Reviews
          <Button className="!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-[#000]" onClick={() => setIsOpenRatingfilter(!isOpenRatingfilter)}>
            {
              isOpenRatingfilter === true ? <FaAngleUp /> : <FaAngleDown />
            }

          </Button>
        </h3>
        <Collapse isOpened={isOpenRatingfilter}>
          <div className='Scroll px-4 relative -left-[13px]'>
            <div className='w-full cursor-pointer' onClick={() => handleRatingChange(5)}>
              <Rating
                name="rating-5"
                value={5}
                size='small'
                readOnly
                className={rating === 5 ? 'text-yellow-500' : 'text-gray-300'}
              />
              <span className='text-xs text-gray-600 ml-2'>5 Stars</span>
            </div>

            <div className='w-full cursor-pointer' onClick={() => handleRatingChange(4)}>
              <Rating
                name="rating-4"
                value={4}
                size='small'
                readOnly
                className={rating === 4 ? 'text-yellow-500' : 'text-gray-300'}
              />
              <span className='text-xs text-gray-600 ml-2'>4 Stars</span>
            </div>

            <div className='w-full cursor-pointer' onClick={() => handleRatingChange(3)}>
              <Rating
                name="rating-3"
                value={3}
                size='small'
                readOnly
                className={rating === 3 ? 'text-yellow-500' : 'text-gray-300'}
              />
              <span className='text-xs text-gray-600 ml-2'>3 Stars</span>
            </div>

            <div className='w-full cursor-pointer' onClick={() => handleRatingChange(2)}>
              <Rating
                name="rating-2"
                value={2}
                size='small'
                readOnly
                className={rating === 2 ? 'text-yellow-500' : 'text-gray-300'}
              />
              <span className='text-xs text-gray-600 ml-2'>2 Stars</span>
            </div>

            <div className='w-full cursor-pointer' onClick={() => handleRatingChange(1)}>
              <Rating
                name="rating-1"
                value={1}
                size='small'
                readOnly
                className={rating === 1 ? 'text-yellow-500' : 'text-gray-300'}
              />
              <span className='text-xs text-gray-600 ml-2'>1 Star</span>
            </div>

            <div className='w-full cursor-pointer' onClick={() => handleRatingChange(0)}>
              <Rating
                name="rating-0"
                value={0}
                size='small'
                readOnly
                className={rating === 0 ? 'text-yellow-500' : 'text-gray-300'}
              />
              <span className='text-xs text-gray-600 ml-2'>Clear Rating</span>
            </div>
          </div>
        </Collapse>
      </div>

      {/* Clear All Filters Button */}
      <div className='box mt-4'>
        <Button
          onClick={clearAllFilters}
          className='!w-full !bg-red-500 !text-white !py-2 !rounded-lg hover:!bg-red-600'
        >
          Clear All Filters
        </Button>
      </div>
    </aside>
  )
}

export default Sidebar
