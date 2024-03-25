package com.example.cookbookpro.ui.fragmentContainers.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.cookbookpro.MainActivity
import com.example.cookbookpro.databinding.FragmentHomeBinding
import com.example.cookbookpro.ui.ingredientsList.IngredientListFragment

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        /*
        val homeViewModel =
            ViewModelProvider(this).get(HomeViewModel::class.java)
        */
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        val root: View = binding.root

        /*val textView: TextView = binding.textHome
        homeViewModel.text.observe(viewLifecycleOwner) {
            textView.text = it
        }*/

        return root
    }


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}